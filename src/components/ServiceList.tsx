import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";

const ServiceList = ({ userSkills = [] }) => { 

  const [services, setServices] = useState<any[]>([]); // Define state properly

  useEffect(() => {
    fetch("/api/service-matching", {
      method: "POST",
      body: JSON.stringify({ userSkills }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.services) {
          setServices(data.services);
        } else {
          console.error("Invalid API response:", data);
        }
      })
      .catch((error) => console.error("Error fetching services:", error));
  }, [userSkills]);

  return (
    <div>
      {services.length === 0 ? (
        <Typography variant="body1" color="textSecondary">No services available</Typography>
      ) : (
        services.map((service, index) => (
          <Card key={index} className="mb-4">
            <CardContent>
              <Typography variant="h6">{service?.title || "Untitled Service"}</Typography>
              <Typography variant="body2">{service?.description || "No description available"}</Typography>
              <Button variant="contained">Request Service</Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ServiceList;

