"use server"

export interface SignupFormData {
  businessName: string
  ownerName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  error?: string
  user?: {
    id: string
    name: string
    email: string
    businessName: string
    phoneNumber: string
    role: "owner"
  }
}

export async function signupBusiness(formData: SignupFormData): Promise<AuthResponse> {
  if (!formData.businessName || !formData.ownerName || !formData.email || !formData.password) {
    return {
      success: false,
      error: "All required fields must be filled",
    }
  }

  if (formData.password !== formData.confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match",
    }
  }

  if (formData.password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters",
    }
  }

  if (!formData.email.includes("@")) {
    return {
      success: false,
      error: "Please enter a valid email address",
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const mockUser = {
    id: `user_${Date.now()}`,
    name: formData.ownerName,
    email: formData.email,
    businessName: formData.businessName,
    phoneNumber: formData.phoneNumber || "",
    role: "owner" as const,
  }

  return {
    success: true,
    message: "Business account created successfully",
    user: mockUser,
  }
}

export async function signinBusiness(email: string, password: string): Promise<AuthResponse> {
  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 800))

  const mockUsers = [
    {
      id: "1",
      name: "Adebayo Okafor",
      email: "owner@business.com",
      businessName: "Okafor General Store",
      phoneNumber: "08012345678",
      role: "owner" as const,
    },
    {
      id: "2",
      name: "Fatima Hassan",
      email: "staff@business.com",
      businessName: "Okafor General Store",
      phoneNumber: "08087654321",
      role: "staff" as const,
    },
  ]

  const foundUser = mockUsers.find((u) => u.email === email)

  if (foundUser && password === "password") {
    return {
      success: true,
      message: "Signed in successfully",
      user: foundUser,
    }
  }

  return {
    success: false,
    error: "Invalid email or password",
  }
}
