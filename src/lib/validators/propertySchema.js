import * as yup from "yup";

export const propertySchema = yup.object().shape({
  title: yup
    .string()
    .required("Please provide a property title")
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title is too long"),
  description: yup
    .string()
    .required("Please add a brief description of the property")
    .min(15, "Description must be at least 15 characters"),
  property_type: yup
    .string()
    .oneOf(["portion", "house", "flat", "room"], "Select a valid property type")
    .required("Property type is required"),
  bedrooms: yup
    .number()
    .typeError("Bedrooms must be a number")
    .min(1, "Minimum 1 bedroom")
    .max(10, "Maximum 10 bedrooms")
    .required("Bedrooms count is required"),
  bathrooms: yup
    .number()
    .typeError("Bathrooms must be a number")
    .min(1, "Minimum 1 bathroom")
    .max(10, "Maximum 10 bathrooms")
    .required("Bathrooms count is required"),
  rent_price: yup
    .number()
    .typeError("Rent price must be a valid number in PKR")
    .positive("Rent must be greater than 0")
    .required("Monthly rent price is required"),
  has_discount: yup.boolean().default(false),
  discounted_price: yup
    .number()
    .typeError("Discounted rent must be a valid number in PKR")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .when("has_discount", {
      is: true,
      then: (schema) =>
        schema
          .required("Please specify the discounted monthly rent")
          .positive("Discounted rent must be greater than 0")
          .test(
            "is-less-than-rent",
            "Discounted rent must be less than the original rent price",
            function (value) {
              const { rent_price } = this.parent;
              if (!value || !rent_price) return true;
              return Number(value) < Number(rent_price);
            }
          ),
      otherwise: (schema) => schema.nullable(),
    }),
  deposit_amount: yup
    .number()
    .typeError("Deposit must be a number")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  area: yup
    .string()
    .trim()
    .min(2, "Please enter a valid neighborhood or area")
    .required("Please specify the property locality/area"),
  street_address: yup
    .string()
    .required("Street or Mohalla detail is required for tenants to locate"),
  phone: yup
    .string()
    .required("WhatsApp contact number is required")
    .matches(/^[0-9+ ]{10,15}$/, "Enter a valid Pakistani mobile number (e.g. 03001234567)"),
  status: yup
    .string()
    .oneOf(["available", "in_deal", "sealed"])
    .default("available"),
  expected_vacancy_date: yup
    .string()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  has_electricity: yup.boolean().default(true),
  has_gas: yup.boolean().default(true),
  has_water: yup.boolean().default(true),
  is_furnished: yup.boolean().default(false),
  has_drainage: yup.boolean().default(true),
  has_roof_leakage: yup.boolean().default(false),
  lease_duration: yup.string().default("1 Year"),
  video_url: yup
    .string()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
});
