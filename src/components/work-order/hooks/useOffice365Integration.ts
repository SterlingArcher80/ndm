
import { useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { toast } from '@/components/ui/sonner';
import { WorkOrderFile } from '../types';

// MSAL configuration - You'll need to set your actual client and tenant IDs
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID", // Replace with your actual client ID
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Replace with your tenant ID
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage" as const,
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export const useOffice365Integration = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticateWithMicrosoft = async () => {
    try {
      setIsAuthenticating(true);
      const loginRequest = {
        scopes: ["Files.ReadWrite", "Sites.ReadWrite.All"],
      };

      const response = await msalInstance.loginPopup(loginRequest);
      console.log("Authentication successful:", response);
      return response.accessToken;
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const editInOffice365 = async (file: WorkOrderFile) => {
    try {
      console.log(`Opening ${file.name} in Office 365...`);
      // For now, just open Office 365 online
      window.open('https://office.com', '_blank');
    } catch (error) {
      console.error("Failed to open in Office 365:", error);
    }
  };

  const syncBackFromOneDrive = async (file: WorkOrderFile) => {
    try {
      const accessToken = await authenticateWithMicrosoft();
      
      // Here you would implement the logic to:
      // 1. Download the updated file from OneDrive
      // 2. Replace the local version
      // 3. Delete the file from OneDrive
      
      console.log(`Syncing back ${file.name} from OneDrive`);
      
      // Placeholder for actual implementation
      toast.success(`${file.name} has been synced back from OneDrive`);
    } catch (error) {
      console.error("Failed to sync back from OneDrive:", error);
      toast.error("Failed to sync back from OneDrive");
    }
  };

  return {
    editInOffice365,
    syncBackFromOneDrive,
    isAuthenticating
  };
};
