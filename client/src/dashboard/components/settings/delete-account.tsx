import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DeleteAccount(){
    
    const [password, setPassword] = useState <string> ('');
    const navigate = useNavigate();
    const submitForm : any = async (event: any) => {
    event.preventDefault();
    
    if (password.trim() === '') return;

    fetch('http://localhost:8080/delete-account',
        {
            method: 'POST',
            credentials: 'include',
            
            body: JSON.stringify({ password }),
        }
    )
    .then(async response => {
        if (!response.ok) {
            const errorMessage = await response.json(); // ✨ await
            throw new Error(errorMessage.error || 'Something went wrong'); // ✨
          }

        return response.json();
    })
    .then(data => {
        console.log(data);
        navigate('/');
    })
    .catch(error => console.error(error));
    };

    
    return(
        <details>
            <summary className=" py-1 border w-70 px-2 rounded mb-2">
                <span className="text-red-500 text-base font-medium" >Delete Account</span>
            </summary>
            <form onSubmit={(event:any) => submitForm(event)} className="flex flex-col p-4 w-70 border border-gray-300 shadow-xl rounded">
                <p className="text-xs font-medium text-red-800">By entering your password. You're willing to delete your account willfully.</p>
                <section className="flex flex-col gap-1 my-1 mb-4">
                    <label className="text-base font-medium" htmlFor="password">Password</label>
                    <input type="password" value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="enter your password..."
                    className="border rounded px-2 py-1"
                    />
                </section>
                <button type="submit"
                className="bg-red-500 text-white font-medium py-1 w-full rounded">Delete Account</button>
            </form>
        </details>
    )
}