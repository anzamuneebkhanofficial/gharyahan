import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const signupSchema = yup.object().shape({
  full_name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  phone: yup
    .string()
    .matches(/^[0-9+ ]{10,15}$/, "Enter a valid phone number (e.g. 03001234567)")
    .required("WhatsApp / phone number is required"),
  cnic: yup
    .string()
    .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, "Enter a valid CNIC format (e.g. 35202-1234567-8)")
    .required("CNIC is required for identity verification"),
  role: yup
    .string()
    .oneOf(["tenant", "landlord"])
    .default("tenant")
    .required("Please select whether you want to rent or list a property"),
  area: yup
    .string()
    .trim()
    .min(2, "Please enter a valid location or area name")
    .required("Please enter or auto-detect your location"),
});
