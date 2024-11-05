import {Button} from "@/components/ui/button";
import {UserType} from "@shared/types";


const App = () => {
    const user: UserType = {
        _id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: "",
        gender: "male",
        dateOfBirth: "2021-09-01",
        role: "admin",
        profilePicture: "",
        phoneNumber: "",
        address: {
            street: "",
            city: "",
            country: "",
            zipCode: "",
        },
        password: "",
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
    };
    return (
        <div>
            <h1 className="text-3xl text-violet-600">Hello World</h1>
           <Button>Click me</Button>
            <div className="mt-4">
                {JSON.stringify(user)}
            </div>
        </div>
    );
};

export default App;