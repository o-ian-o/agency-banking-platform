export const Logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    // Pro-tip: Here you could add an Axios call to send this error
    // to a new Spring Boot endpoint (e.g., POST /api/v1/logs)
    // which would then write it to the backend file.
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};
