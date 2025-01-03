import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Header } from "./components/header";

function App() {
    const [location, setLocation] = useState<{
        latitude: number | null;
        longitude: number | null;
    }>({ latitude: null, longitude: null });

    const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt" | "unsupported" | null>(
        null
    );

    const baseLocation = useMemo(
        () => [
            { latitude: 10.854515, longitude: 106.6260176 },
            { latitude: 10.800072026385916, longitude: 106.67512713713947 },
            { latitude: 16.0472002, longitude: 108.2199588 },
        ],
        [] // Empty dependency array ensures it is created only once
    );

    const [isInsideZone, setIsInsideZone] = useState<boolean>(false);

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

                // Check if the user is within 500 meters of any base location
                const withinZone = baseLocation.some((loc) => {
                    const distance = calculateDistance(
                        location.latitude as number,
                        location.longitude as number,
                        loc.latitude,
                        loc.longitude
                    );
                    return distance < 500;
                });

                setIsInsideZone(withinZone);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }, [location.latitude, location.longitude]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

        const earthRadius = 6371000; // Radius of the Earth in meters

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c; // Distance in meters
    };

    return (
        <main className="main">
            <Header />
            <div className="banner">
                <img
                    src="https://hitachids.com/vn-english/wp-content/uploads/sites/6/2024/06/ds-overview-1-e1718270241356.jpg"
                    alt="banner"
                    className="banner_img"
                />
            </div>
            <div className="content">
                <h2>
                    Year-End Party 2024 <br />
                    One Hitachi - Global Mindset – Vietnam Culture
                </h2>
                {isInsideZone || permissionStatus === "granted" ? (
                    <button
                        onClick={() => {
                            // Redirect
                            window.location.href =
                                "https://forms.office.com/Pages/ResponsePage.aspx?id=Fx55GFlhUk-o1N6BTKgoSnPuMPecgIBHrBWigH1oSM5UNUZOOEtRMEpUT0pRUVU4WVIzTFpIUkZDNy4u";
                        }}
                    >
                        Go To Form
                    </button>
                ) : (
                    <h3>Sorry, you are not within the zone to access the form !!!</h3>
                )}
            </div>
        </main>
    );
}

export default App;
