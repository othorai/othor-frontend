import { FC } from 'react';
import { Card } from "@/components/ui/card";
import { 
  Book, 
  Lightbulb, 
  Bug, 
  FileText, 
  Shield, 
  ExternalLink 
} from 'lucide-react';

const HelpAndSupport: FC = () => {
  const supportLinks = [
    {
      title: "Tutorials & Documentation",
      description: "Learn how to use our platform with step-by-step guides and detailed documentation.",
      icon: Book,
      href: "/docs"
    },
    {
      title: "Suggest a Feature",
      description: "Have an idea for improving our platform? We'd love to hear it.",
      icon: Lightbulb,
      href: "/feedback"
    },
    {
      title: "Report a Bug",
      description: "Help us improve by reporting any issues you encounter.",
      icon: Bug,
      href: "/bug-report"
    },
    {
      title: "Terms of Service",
      description: "Read our terms of service to understand your rights and responsibilities.",
      icon: FileText,
      href: "/terms"
    },
    {
      title: "Privacy Policy",
      description: "Learn about how we handle and protect your data.",
      icon: Shield,
      href: "/privacy"
    }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Help & Support</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get help, share feedback, and learn more about our platform
          </p>
        </div>

        <div className="space-y-4">
          {supportLinks.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{item.title}</h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default HelpAndSupport;