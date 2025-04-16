import { useState} from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
export default function NavigationBar(){

    const [toggle, setToggle] = useState <boolean> (false);

    const router : any[] = [
        {path:'/', name: 'Home'},
        {path:'/about', name: 'About'},
        {path:'/services', name: 'Services'},
        {path:'/contact', name: 'Contact'},
    ];
    
    return(
        <header className="sticky bg-gray-50 w-full flex py-5 justify-between top-0 z-50">
            <NavLink to={'/'} className="flex flex-col mx-5" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <h1 className="text-base font-medium">Logo</h1>
            </NavLink>
            <nav className="flex flex-col mx-5">
                {
                    toggle ? 
                    <X
                    onClick={() => {setToggle(!toggle)}}
                    className="block md:hidden"
                    /> :
                    <Menu
                    onClick={() => {setToggle(!toggle)}}
                    className="block md:hidden"
                    /> 
                }
                
                <ol className={`${toggle ? 'translate-y-10' : '-translate-y-100 invisible'} absolute left-0 md:translate-y-0 md:visible  md:static text-base font-medium flex flex-col 
                px-5 py-3 md:py-0 md:px-0 md:flex-row bg-gray-50 w-full space-y-5 md:space-y-0 md:gap-5
                transition-all ease-in-out duration-300
                `}>
                   {router.map((route, index) => 
                        <NavLink key={index} 
                        to={route.path} className={({ isActive }) => isActive ? "underline text-gray-900" : "text-gray-600 hover:text-gray-900 hover:underline"}
                        onClick={() => {setToggle(!toggle)}}>
                            <li>{route.name}</li>
                        </NavLink>
                    )}
                    
                    <NavLink to={'/login'} 
                    className={({isActive}) => `${isActive ? 'underline' : ''}`}
                    onClick={() => {setToggle(false)}}>
                        <li>Login</li>
                    </NavLink>
                    <NavLink to={'/register'} className={({isActive}) => `${isActive ? 'underline' : ''}`}
                    onClick={() => {setToggle(false)}}>
                        <li>Register</li>
                    </NavLink>
                </ol>
            </nav>
        </header>
    )
}