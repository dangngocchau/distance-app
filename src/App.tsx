import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
    const [location, setLocation] = useState<{
        latitude: number | null;
        longitude: number | null;
    }>({ latitude: null, longitude: null });

    const [permissionStatus, setPermissionStatus] = useState<
        "granted" | "denied" | "prompt" | "unsupported" | null
    >(null);

    const baseLocation = {
        latitude: 16.059184088459475,
        longitude: 108.22383740400188,
    };

    const [isInsideZone, setIsInsideZone] = useState<boolean>(false);
    const [name, setName] = useState<string>("");

    useEffect(() => {
        if (navigator.permissions) {
            navigator.permissions
                .query({ name: "geolocation" as PermissionName })
                .then((permissionStatus) => {
                    permissionStatus.onchange = () => {
                        setPermissionStatus(permissionStatus.state);
                    };
                })
                .catch(() => {
                    setPermissionStatus("unsupported"); // If the API is not supported
                });
        } else {
            setPermissionStatus("unsupported"); // If the API is not supported
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                const distance = calculateDistance(
                    location.latitude as number,
                    location.longitude as number,
                    baseLocation.latitude,
                    baseLocation.longitude
                );

                if (distance < 100) {
                    setIsInsideZone(true);
                } else {
                    setIsInsideZone(false);
                }
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }, [
        location.latitude,
        location.longitude,
        baseLocation.latitude,
        baseLocation.longitude,
    ]);

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

    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

        const earthRadius = 6371000; // Radius of the Earth in meters

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
                Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c; // Distance in meters
    };

    if (permissionStatus === "denied") {
        return <h1>Permission Denied</h1>;
    }

    return (
        <div>
            <h1>Geolocation</h1>
            <div className="wrapper">
                <div className="underline">
                    <h3>Current Location</h3>
                    <p>Latitude: {location.latitude}</p>
                    <p>Longitude: {location.longitude}</p>
                </div>
                <div>
                    <h3>Target Location: HDS Da Nang</h3>
                    <p>Latitude: {baseLocation.latitude}</p>
                    <p>Longitude: {baseLocation.longitude}</p>
                </div>
            </div>

            <h3>
                Distance To HDS Da Nang:{" "}
                {calculateDistance(
                    location.latitude as number,
                    location.longitude as number,
                    baseLocation.latitude,
                    baseLocation.longitude
                ).toFixed(2)}{" "}
                meters
            </h3>
            <br />
            {isInsideZone ? (
                <>
                    <h3>You are within 100m radius !!</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form">
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                onChange={handleChangeName}
                                className="input"
                            />
                        </div>
                        <button type="submit" className="submitButton">
                            Submit
                        </button>
                    </form>
                </>
            ) : (
                <h3>You are not within 100m radius, please try again !!</h3>
            )}
        </div>
    );
}

export default App;
