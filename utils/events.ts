// utils/events.ts
export const createOrganizationChangeEvent = (organization: { id: string; name: string }) => {
    return new CustomEvent('organizationChanged', {
      detail: organization
    });
  };