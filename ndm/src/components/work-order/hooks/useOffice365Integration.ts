import { useState, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { toast } from '@/components/ui/sonner';
import { WorkOrderFile } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// MSAL configuration with your actual client and tenant IDs
const msalConfig = {
  auth: {
    clientId: "b059e7f3-5b24-41aa-aac7-2e3ce06dff93",
    authority: "https://login.microsoftonline.com/674c622c-37ad-4e41-877a-0e070ebb7adc",
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
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        setIsInitialized(true);
        console.log("MSAL instance initialized successfully");
      } catch (error) {
        console.error("Failed to initialize MSAL:", error);
        toast.error("Failed to initialize Microsoft authentication");
      }
    };

    initializeMsal();
  }, []);

  const authenticateWithMicrosoft = async () => {
    if (!isInitialized) {
      throw new Error("MSAL not initialized yet");
    }

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
      toast.error("Failed to authenticate with Microsoft");
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const editInOffice365 = async (file: WorkOrderFile) => {
    if (!isInitialized) {
      toast.error("Microsoft authentication is still initializing. Please try again in a moment.");
      return;
    }

    try {
      setIsUploading(true);
      console.log(`Starting Office 365 edit workflow for ${file.name}...`);
      
      // Authenticate with Microsoft
      const accessToken = await authenticateWithMicrosoft();
      
      // Call our Supabase Edge Function to handle the file upload to OneDrive
      const { data, error } = await supabase.functions.invoke('office365-operations', {
        body: {
          action: 'upload',
          fileId: file.id,
          fileName: file.name,
          fileUrl: file.file_url,
          accessToken: accessToken
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.oneDriveUrl) {
        // Open the file in Office 365 web app
        window.open(data.oneDriveUrl, '_blank');
        toast.success(`${file.name} opened in Office 365. Use "Syncback" when you're done editing.`);
      } else {
        throw new Error('Failed to get OneDrive URL');
      }
    } catch (error) {
      console.error("Failed to open in Office 365:", error);
      toast.error(`Failed to open ${file.name} in Office 365`);
    } finally {
      setIsUploading(false);
    }
  };

  const syncBackFromOneDrive = async (file: WorkOrderFile) => {
    if (!isInitialized) {
      toast.error("Microsoft authentication is still initializing. Please try again in a moment.");
      return;
    }

    try {
      setIsSyncing(true);
      console.log(`Starting syncback workflow for ${file.name}...`);
      
      // Authenticate with Microsoft
      const accessToken = await authenticateWithMicrosoft();
      
      // Call our Supabase Edge Function to handle the file download and replacement
      const { data, error } = await supabase.functions.invoke('office365-operations', {
        body: {
          action: 'syncback',
          fileId: file.id,
          fileName: file.name,
          accessToken: accessToken
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success(`${file.name} has been synced back from OneDrive`);
        
        // Invalidate relevant queries to refresh data without losing navigation state
        queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
        queryClient.invalidateQueries({ queryKey: ['onedrive-info', file.id] });
      } else {
        throw new Error('Failed to sync back file');
      }
    } catch (error) {
      console.error("Failed to sync back from OneDrive:", error);
      toast.error("Failed to sync back from OneDrive");
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    editInOffice365,
    syncBackFromOneDrive,
    isAuthenticating,
    isUploading,
    isSyncing,
    isInitialized
  };
};
