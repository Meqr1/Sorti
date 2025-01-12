'use client'
import { useActionState } from "react";
import instance from "@/lib/axios";

export async function signup(state: unknown, formData: FormData) {
  const response = await instance.post('/api/auth/signup', {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (response.data.success && response.data.cookie) {
    console.log('Signup successful, user ID:', response.data.userId);
  } else {
    //console.log('Signup error:', response.data.errors || response.data.error);
    //return response.data.errors
  }
}

export default function Signup() {
  const [, action, pending] = useActionState(signup, null)

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <form action={action} className="flex gap-3 flex-col w-[400px]">
        <div className="flex-col flex">
          <label className="m-0">Name</label>
          <input name="name" className="bg-black border rounded-xl p-2 px-5 outline-none" placeholder="John Doe" />
        </div>
        <div className="flex-col flex">
          <label className="m-0">Name</label>
          <input name="email" className="bg-black border rounded-xl p-2 px-5 outline-none" placeholder="john@example.com" />
        </div>
        <div className="flex flex-col">
          <label className="m-0">Name</label>
          <input name="password" className="bg-black border rounded-xl p-2 px-5 outline-none" placeholder="Password" />
        </div>

        <button disabled={pending} className="border border-white bg-white text-black rounded-xl p-2 px-5 text-center">
        {pending ? 'Submitting... ' : 'Sign up' }
        </button>
      </form>
    </div>
  )
}
