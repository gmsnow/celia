import { z } from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export const EMPLOYEE_DEPARTMENTS = [
  "PHYSICAL_THERAPY",
  "NUTRITION",
  "ADMINISTRATION",
  "IT",
  "SECRETARY",
  "GUARD",
] as const;

export type EmployeeDepartment = (typeof EMPLOYEE_DEPARTMENTS)[number];

const optionalDepartment = z
  .string()
  .refine(
    (value) => value === "" || (EMPLOYEE_DEPARTMENTS as readonly string[]).includes(value),
    (value) => (value === "" ? undefined : "department_error"),
  );

export function createEmployeeSchema(t: Dictionary) {
  return z.object({
    name: z.string().min(1, t.employeesManagement.nameError),
    department: optionalDepartment.optional().default(""),
    phone: z.string().max(30, t.employeesManagement.phoneError).optional().default(""),
    salary: z.coerce
      .number(t.employeesManagement.salaryError)
      .nonnegative(t.employeesManagement.salaryError)
      .optional(),
    isActive: z.boolean().optional().default(true),
  });
}

export function updateEmployeeSchema(t: Dictionary) {
  return z
    .object({
      name: z.string().min(1, t.employeesManagement.nameError).optional(),
      department: optionalDepartment.optional(),
      phone: z.string().max(30, t.employeesManagement.phoneError).optional(),
      salary: z.coerce
        .number(t.employeesManagement.salaryError)
        .nonnegative(t.employeesManagement.salaryError)
        .optional(),
      isActive: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, t.employeesManagement.invalidData);
}

export type EmployeeInput = z.infer<ReturnType<typeof createEmployeeSchema>>;
export type EmployeeUpdateInput = z.infer<ReturnType<typeof updateEmployeeSchema>>;
