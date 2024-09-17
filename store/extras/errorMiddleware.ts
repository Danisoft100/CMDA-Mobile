import Toast from "react-native-toast-message";

const errorMiddleware = () => (next: any) => (action: any) => {
  const isRejected = action.type.endsWith("/rejected");
  const isFulfilled = action.type.endsWith("/fulfilled");

  const getErrorMessage = () => {
    const { data, error, originalStatus } = action.payload;
    if (data?.errors) {
      return Object.values(action?.payload?.data?.errors)?.flat()?.[0];
    } else if (originalStatus === 500) {
      return "Oops, an error occured on the server";
    } else {
      return data?.error || data?.message || error?.message || error || "Oops, something went wrong, try again";
    }
  };

  // check if action is rejected or is fufilled but an error exists
  if ((isFulfilled && action.payload?.error) || isRejected) {
    // show a toast with the error message
    Toast.show({ type: "error", text1: getErrorMessage() });
  }

  // Pass the action to the next middleware or the reducer
  return next(action);
};

export default errorMiddleware;
