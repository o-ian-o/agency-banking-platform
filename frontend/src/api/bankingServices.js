import apiClient from "./apiClient";

export const BankingServices = {
  // ==========================================
  // 1. REAL API ENDPOINTS
  // ==========================================

  login: async (userId, password) => {
    try {
      // Sending password instead of userName
      const response = await apiClient.post("/auth/login", {
        userId,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error("Invalid User ID or Password");
    }
  },

  initiatePaymentTransfer: async (transferRequest) => {
    const response = await apiClient.post(
      "/transfers/initiate",
      transferRequest,
    );
    return response.data;
  },

  fetchMakerInquiries: async () => {
    const response = await apiClient.get("/transfers/maker-inquiries");
    return response.data;
  },

  fetchTransfersForChecker: async (filters) => {
    // Send filters, or empty object if none provided
    const response = await apiClient.post(
      "/transfers/checker-queue",
      filters || {},
    );
    return response.data;
  },

  authorizeTransfer: async (actionPayload) => {
    const response = await apiClient.post(
      "/transfers/authorize",
      actionPayload,
    );
    return response.data;
  },

  // ==========================================
  // 2. ENDPOINTS (Pending Backend Controllers)
  // ==========================================

  // Required for Maker/Checker Dropdowns
  // ==========================================
  // MASTER DATA ENDPOINTS
  // ==========================================
  fetchPaymentTypesMaster: async () => {
    const response = await apiClient.get("/master-data/payment-types");
    return response.data;
  },
  savePaymentTypeMaster: async (data) => {
    const response = await apiClient.post("/master-data/payment-types", data);
    return response.data;
  },
  fetchBeneficiaryBicsMaster: async (paymentTypeId = null) => {
    // If an ID is provided, append it to the URL, otherwise fetch all
    const url = paymentTypeId
      ? `/master-data/bics?paymentTypeId=${paymentTypeId}`
      : "/master-data/bics";
    const response = await apiClient.get(url);
    return response.data;
  },
  saveBeneficiaryBicMaster: async (data) => {
    const response = await apiClient.post("/master-data/bics", data);
    return response.data;
  },

  // Required for Group Master Dashboard
  fetchGroups: async () => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve([
            {
              groupId: "GRP_SUPERUSER",
              groupName: "SUPERUSER",
              description: "Complete system access",
            },
            {
              groupId: "GRP_ADMIN",
              groupName: "ADMIN",
              description: "Administrative access",
            },
            {
              groupId: "GRP_MAKER",
              groupName: "MAKER",
              description: "Initiates transactions",
            },
            {
              groupId: "GRP_CHECKER",
              groupName: "CHECKER",
              description: "Authorizes transactions",
            },
          ]),
        300,
      );
    });
  },

  saveGroup: async (groupData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Mock saved group:", groupData);
        resolve({ success: true });
      }, 300);
    });
  },

  // Required for User Management Dashboard
  fetchUsers: async () => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve([
            {
              userId: "SUP-00001",
              userName: "System Administrator",
              groupId: "GRP_SUPERUSER",
            },
            {
              userId: "MKR-00001",
              userName: "Jane Maker",
              groupId: "GRP_MAKER",
            },
            {
              userId: "CHK-00001",
              userName: "John Checker",
              groupId: "GRP_CHECKER",
            },
          ]),
        300,
      );
    });
  },

  createUser: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate Meaningful Mock ID
        const prefix = userData.groupId
          ? userData.groupId.replace("GRP_", "").substring(0, 3).toUpperCase()
          : "USR";
        const generatedId = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
        resolve({ ...userData, userId: generatedId });
      }, 400);
    });
  },
};
