import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
    const [location, setLocation] = useState<{
        latitude: number | null;
        longitude: number | null;
    }>({ latitude: null, longitude: null });
    const [isInsideZone, setIsInsideZone] = useState<boolean>(false);
    const [name, setName] = useState<string>("");

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                if (
                    isWithin100Meters(
                        position.coords.latitude,
                        position.coords.longitude,
                        16.057,
                        108.2261504
                    )
                ) {
                    setIsInsideZone(true);
                } else {
                    setIsInsideZone(false);
                }
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }, [location.latitude, location.longitude]);

    const isWithin100Meters = (
        currentLat: number,
        currentLon: number,
        targetLat: number,
        targetLon: number
    ) => {
        const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

        const R = 6371000; // Earth's radius in meters
        const dLat = toRadians(targetLat - currentLat);
        const dLon = toRadians(targetLon - currentLon);

        const lat1 = toRadians(currentLat);
        const lat2 = toRadians(targetLat);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) *
                Math.sin(dLon / 2) *
                Math.cos(lat1) *
                Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in meters

        return distance <= 100; // Check if within 100 meters
    };

    const writeToExcel = (data: any) => {
        const worksheet = XLSX.utils.json_to_sheet(data); // Convert JSON to sheet
        const workbook = XLSX.utils.book_new(); // Create a new workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Locations"); // Add sheet to workbook
        XLSX.writeFile(workbook, "locations.xlsx");
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        writeToExcel([
            {
                name: name,
                latitude: location.latitude,
                longitude: location.longitude,
            },
        ]);
    };

    const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setName(name);
    };

    return (
        <div>
            <h1>Geolocation</h1>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            {isInsideZone ? (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        onChange={handleChangeName}
                    />
                    <button type="submit">Submit</button>
                </form>
            ) : (
                <h3>You are not within 100m radius, please try again !!</h3>
            )}
        </div>
    );
}

export default App;
