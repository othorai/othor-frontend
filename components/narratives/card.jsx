//components/narratives/card.tsx
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { NarrativeChart } from './charts';
import { Heart, Download, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SuggestedQuestions } from './suggested-questions';

export function NarrativeCard({
  title,
  content,
  graphData,
  sourceInfo,
  category,
  timePeriod,
  articleId,
  isLiked,
  onLike,
}) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const chartRef = useRef(null);
  const { toast } = useToast();

  const formatMetricName = (metric) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const metrics = Object.keys(graphData || {}).filter(key => 
    typeof graphData[key] === 'object' && 
    'current' in graphData[key] &&
    'previous' in graphData[key]
  );

  const truncateText = (text, limit) => {
    if (!text || text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  };

  const formatTimePeriod = (timePeriod) => {
    if (!timePeriod) return '';
  
    // Handle daily and weekly formats
    const dailyWeeklyMatch = timePeriod?.match(/(daily|weekly)\s*\((.*?)\)/i);
    if (dailyWeeklyMatch) {
      const [, type, period] = dailyWeeklyMatch;
      
      // Daily format: "27-12-2024" -> "Daily Report - 27 Dec 2024"
      if (type.toLowerCase() === 'daily') {
        const [day, month, year] = period.split('-');
        const date = new Date(year, month - 1, day);
        return `Daily Report - ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${year}`;
      }
      
      // Weekly format: "Week 2" -> "Weekly Report - Week 2 of Jan"
      if (type.toLowerCase() === 'weekly') {
        const currentDate = new Date();
        const month = currentDate.toLocaleString('default', { month: 'short' });
        const weekNumber = period.replace('Week ', '');
        return `Weekly Report - Week ${weekNumber} of ${month}`;
      }
    }
  
    // Handle monthly format: "monthly (December 2024 (16th-31))" -> "Monthly Report - December 2024 (1st to 15th)"
    const monthlyMatch = timePeriod?.match(/monthly\s*\((.*?)\s*\((.*?)\)\)/i);
    if (monthlyMatch) {
      const [, monthYear, dateRange] = monthlyMatch;
      const [startDay, endDay] = dateRange.split('-')
        .map(day => day.replace(/(st|nd|rd|th)/, '').trim());
      
      // Add ordinal suffix to numbers
      const addOrdinalSuffix = (num) => {
        const n = parseInt(num);
        if (n % 10 === 1 && n % 100 !== 11) return n + "st";
        if (n % 10 === 2 && n % 100 !== 12) return n + "nd";
        if (n % 10 === 3 && n % 100 !== 13) return n + "rd";
        return n + "th";
      };
  
      const formattedStart = addOrdinalSuffix(startDay);
      const formattedEnd = addOrdinalSuffix(endDay);
  
      return `Monthly Report - ${monthYear} (${formattedStart} to ${formattedEnd})`;
    }
  
    return timePeriod;
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Create PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yOffset = 20;
  
      // Add title
      pdf.setFontSize(16);
      pdf.text(title, 20, yOffset);
      yOffset += 15;
  
      // Add time period
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(formatTimePeriod(timePeriod), 20, yOffset);
      yOffset += 10;
  
      // Add content
      pdf.setFontSize(12);
      pdf.setTextColor(0);
      const contentLines = pdf.splitTextToSize(content, pageWidth - 40);
      pdf.text(contentLines, 20, yOffset);
      yOffset += (contentLines.length * 7) + 15;
  
      // Add metrics
      if (metrics[currentMetricIndex]) {
        const currentMetric = metrics[currentMetricIndex];
        const metricData = graphData[currentMetric];
  
        // Add metric title
        pdf.setFontSize(14);
        pdf.text(formatMetricName(currentMetric), 20, yOffset);
        yOffset += 10;
  
        // Format dates for table headers
        const formatDate = (date) => {
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
          }).replace(/ /g, ' ');
        };
  
        // Get current and previous dates
        let currentDate, previousDate;
        if (timePeriod?.toLowerCase().includes('daily')) {
          const match = timePeriod.match(/(\d{1,2}-\d{1,2}-\d{4})/);
          if (match) {
            const [day, month, year] = match[1].split('-');
            currentDate = new Date(year, month - 1, day);
            previousDate = new Date(currentDate);
            previousDate.setDate(previousDate.getDate() - 1);
          }
        } else if (timePeriod?.toLowerCase().includes('weekly')) {
          currentDate = new Date();
          previousDate = new Date(currentDate);
          previousDate.setDate(previousDate.getDate() - 7);
        }
  
        // Add metric values in a table with dates in header
        const tableData = [
          [
            '',
            'Previous\n' + (previousDate ? formatDate(previousDate) : ''),
            'Current\n' + (currentDate ? formatDate(currentDate) : ''),
            'Change'
          ],
          [
            formatMetricName(currentMetric),
            metricData.previous.toFixed(2),
            metricData.current.toFixed(2),
            `${metricData.change_percentage >= 0 ? '+' : ''}${metricData.change_percentage.toFixed(2)}%`
          ]
        ];
  
        pdf.autoTable({
          startY: yOffset,
          head: [tableData[0]],
          body: [tableData[1]],
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          headStyles: {
            fillColor: [192, 0, 250],
            textColor: 255,
            cellPadding: { top: 5, bottom: 5 },
            minCellHeight: 20,
            valign: 'middle',
            halign: 'center'
          },
          columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' }
          },
          didParseCell: function(data) {
            if (data.section === 'head') {
              data.cell.styles.whiteSpace = 'pre-wrap';
            }
          }
        });
        yOffset = pdf.lastAutoTable.finalY + 15;
      }
  
      // Add chart if exists
      if (chartRef.current) {
        try {
          const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#ffffff'
          });
          const chartImage = canvas.toDataURL('image/png');
          
          // Calculate dimensions to fit chart
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
          // Add new page if chart doesn't fit
          if (yOffset + imgHeight > pageHeight) {
            pdf.addPage();
            yOffset = 20;
          }
  
          pdf.addImage(chartImage, 'PNG', 20, yOffset, imgWidth, imgHeight);
        } catch (error) {
          console.error('Failed to capture chart:', error);
        }
      }
  
      // Save the PDF
      pdf.save(`narrative-${articleId}.pdf`);
  
      toast({
        title: "Success",
        description: "PDF generated successfully"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF"
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="pt-6">
        {/* Time Period */}
        <div className="mb-2 text-base font-medium text-gray-500">
          {formatTimePeriod(timePeriod)}
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-medium text-gray-900 mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-base mb-6">
          {showFullDescription ? content : truncateText(content, 300)}
          {content?.length > 300 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="ml-1 text-primary hover:text-primary-dark font-medium"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>

        {/* Metrics Navigation */}
        {metrics.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto py-2">
            {metrics.map((metric, index) => (
              <button
                key={metric}
                onClick={() => setCurrentMetricIndex(index)}
                className={`px-4 py-2 rounded-full text-base whitespace-nowrap ${
                  index === currentMetricIndex
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {formatMetricName(metric)}
              </button>
            ))}
          </div>
        )}

        {/* Chart */}
        {metrics[currentMetricIndex] && (
          <div ref={chartRef} className="mt-4">
            <NarrativeChart
              data={graphData[metrics[currentMetricIndex]]}
              title={formatMetricName(metrics[currentMetricIndex])}
              timePeriod={timePeriod}
            />
          </div>
        )}

        {/* Add the SuggestedQuestions component */}
<SuggestedQuestions
  articleId={articleId}
  title={title}
  content={content}
  category={category}
  timePeriod={timePeriod}
  metrics={graphData}
/>

        {/* Card Actions */}
        <div className="flex items-center justify-between mt-6 pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(articleId, !isLiked)}
              className={`flex items-center gap-2 ${
                isLiked ? 'text-red-500' : 'text-gray-600'
              } hover:text-red-600`}
            >
              <Heart className={isLiked ? 'fill-current' : ''} size={18} />
              <span className="text-base">{isLiked ? 'Liked' : 'Like'}</span>
            </button>
            <button 
  onClick={handleDownload}
  disabled={downloading}
  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
>
  {downloading ? (
    <>
      <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
      <span className="text-base">Generating PDF...</span>
    </>
  ) : (
    <>
      <Download size={18} />
      <span className="text-base">PDF</span>
    </>
  )}
</button>
            <button className="text-gray-600 hover:text-gray-800">
              <Info size={18} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}