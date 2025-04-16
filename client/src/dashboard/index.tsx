import { Outlet } from "react-router-dom"
import NavigationBar from "./components/navigation-bar"
export default function Layout(){
    return(
        <>
            <NavigationBar/>
            <main>
                <Outlet/>
            </main>
        </>
    )
}