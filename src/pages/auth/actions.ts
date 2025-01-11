import instance from "@/lib/axios";

export async function signup(state: unknown, formData: FormData) {
  const response = await instance.post('/api/auth/signup', {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (response.data.success) {
    console.log('Signup successful, user ID:', response.data.userId);
  } else {
    console.log('Signup error:', response.data.errors || response.data.error);
    return response.data.errors
  }
}
