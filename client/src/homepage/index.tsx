import { Outlet } from "react-router-dom"
import NavigationBar from "./components/navigation-bar"
import ScrollToTop from "../components/scroll-to-top"
export default function Layout(){



    return(
        <>
            <NavigationBar/>
            <ScrollToTop/>
            <main className="h-600">  
                <Outlet/>
            </main>
        </>
    )
}