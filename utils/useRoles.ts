import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";

export const useRoles = () => {
  const { user } = useSelector(selectAuth);

  const isStudent = user.role === "Student";
  const isDoctor = user.role === "Doctor";
  const isGlobalNetwork = user.role === "GlobalNetwork";

  return { isStudent, isDoctor, isGlobalNetwork, roleCurrency: isGlobalNetwork ? "USD" : "NGN" };
};
