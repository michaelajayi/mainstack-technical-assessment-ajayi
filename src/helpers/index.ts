export const successResponse = (message: string, data: any) => {
  return {
    status: "success",
    message,
    data,
  };
};
