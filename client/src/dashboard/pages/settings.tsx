import DeleteAccount from "../components/settings/delete-account"

export default function Settings(){
    return(
        <section className="w-full flex flex-col items-center justify-center">
            <h1 className="text-base font-medium mb-3">This is Settings</h1>
            <DeleteAccount/>
        </section>
    )
}