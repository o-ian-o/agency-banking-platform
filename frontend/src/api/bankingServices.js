import apiClient from "./apiClient";

// --- IN-MEMORY MOCK DATABASE ---
let mockTransactionTable = [];
let serialCounter = 1;

// --- MASTER TABLES (Mocking the DB Schema) ---
let mockPaymentTypesDB = [
  {
    typeCode: "RTGSCO",
    description: "Real-Time Gross Settlement (Domestic)",
    minAmount: 1000,
    maxAmount: 9999999,
    currency: "USD",
  },
  {
    typeCode: "SWIFTCO",
    description: "International SWIFT Transfer Network",
    minAmount: 50,
    maxAmount: 10000000,
    currency: "USD",
  },
];

let mockBicCodesDB = [
  {
    bicCode: "BOFAUS3N",
    bankName: "Bank of America",
    branchName: "New York Main",
    allowedTypes: ["RTGSCO", "SWIFTCO"],
  },
  {
    bicCode: "HDFCINGB",
    bankName: "HDFC Bank",
    branchName: "Mumbai Central",
    allowedTypes: ["SWIFTCO"],
  },
];

export const BankingServices = {
  // ... [KEEP YOUR EXISTING PROFILE, VOUCHER, AND SYNC FUNCTIONS HERE] ...

  // --- PAYMENT TRANSFER TRANSACTIONS ---
  initiatePaymentTransfer: async (transferRequest) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prefix = transferRequest.paymentType
          .substring(0, 2)
          .toUpperCase();
        const sequentialNum = String(serialCounter++).padStart(8, "0");
        const generatedSerialNo = `${prefix}${sequentialNum}`;

        const newTransaction = {
          paymentSerialNo: generatedSerialNo,
          status: "PENDING_AUTHORIZATION",
          outIn: "OUT",
          ...transferRequest,
          makerId: "MAKER_001",
          makerDate: new Date().toISOString(),
          checkerId: null,
          checkerDate: null,
          checkerRemarks: null,
        };

        mockTransactionTable.unshift(newTransaction);
        resolve(newTransaction);
      }, 600);
    });
  },

  fetchMakerInquiries: async () => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...mockTransactionTable]), 400),
    );
  },

  // Expected Spring Boot Controller: POST /api/v1/transfers/checker-queue (Using POST or GET with query params for complex filters)
  fetchTransfersForChecker: async (filters) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockTransactionTable];

        // Apply Checker Filters if provided
        if (filters) {
          if (filters.status && filters.status !== "ALL") {
            results = results.filter((t) => t.status === filters.status);
          }
          if (filters.paymentType && filters.paymentType !== "") {
            results = results.filter(
              (t) => t.paymentType === filters.paymentType,
            );
          }
          if (filters.fromAccount && filters.fromAccount.trim() !== "") {
            results = results.filter((t) =>
              t.fromAccount.includes(filters.fromAccount.trim()),
            );
          }
          if (filters.toAccount && filters.toAccount.trim() !== "") {
            // Matching against Beneficiary Account from the Maker form
            results = results.filter((t) =>
              t.beneficiaryAccount.includes(filters.toAccount.trim()),
            );
          }
          if (filters.fromDate) {
            results = results.filter((t) => t.date >= filters.fromDate);
          }
          if (filters.toDate) {
            results = results.filter((t) => t.date <= filters.toDate);
          }
        }

        resolve(results);
      }, 500);
    });
  },

  authorizeTransfer: async (actionPayload) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTransactionTable.findIndex(
          (t) => t.paymentSerialNo === actionPayload.paymentSerialNo,
        );
        if (index !== -1) {
          mockTransactionTable[index] = {
            ...mockTransactionTable[index],
            status:
              actionPayload.action === "APPROVE"
                ? "AUTHORIZED"
                : actionPayload.action === "REJECT"
                  ? "REJECTED"
                  : "MODIFICATION_REQUESTED",
            checkerId: "CHECKER_999",
            checkerDate: new Date().toISOString(),
            checkerRemarks: actionPayload.remarks,
          };
          resolve({ success: true });
        } else reject(new Error("Transaction not found"));
      }, 600);
    });
  },

  // --- MASTER MANAGEMENT APIs ---

  // Payment Type Masters
  fetchPaymentTypesMaster: async () => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...mockPaymentTypesDB]), 200),
    );
  },

  savePaymentTypeMaster: async (payload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockPaymentTypesDB.findIndex(
          (pt) => pt.typeCode === payload.typeCode,
        );
        if (index !== -1) {
          mockPaymentTypesDB[index] = payload; // Modify
        } else {
          mockPaymentTypesDB.push(payload); // Add
        }
        resolve({ success: true, data: payload });
      }, 400);
    });
  },

  // BIC Code Masters
  fetchBicCodesMaster: async () => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...mockBicCodesDB]), 200),
    );
  },

  saveBicCodeMaster: async (payload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockBicCodesDB.findIndex(
          (bic) => bic.bicCode === payload.bicCode,
        );
        if (index !== -1) {
          mockBicCodesDB[index] = payload; // Modify
        } else {
          mockBicCodesDB.push(payload); // Add
        }
        resolve({ success: true, data: payload });
      }, 400);
    });
  },
};
