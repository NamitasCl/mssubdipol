const http = require('http');

const TOKEN = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOSVNUUkFET1IiLCJST0xFX0pFRkUiLCJST0xFX0ZVTkNJT05BUklPIl0sIm5vbWJyZVVzdWFyaW8iOiJFTlpPIEFMRUpBTkRSTyBSQU1JUkVaIFNJTFZBIiwibm9tYnJlVW5pZGFkIjoiUExBTkEgTUFZT1IgREUgTEEgU1VCRElQT0wiLCJzaWdsYXNVbmlkYWQiOiJQTVNVQkRJUE9MIiwiaXNBZG1pbiI6dHJ1ZSwic3ViIjoiRVJBTUlSRVpTIiwiaWF0IjoxNjc4ODg2NDAwLCJleHAiOjk5OTk5OTk5OTl9.Ao95744sWwIirfgwrnIFHoR56SJXxu2cDGRBM2upSEZqX9tfvsnD04ZMB_71Xp49t6crwGu5Zy912_iauM3hpw";

function getEvents() {
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/eventos',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + TOKEN
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            if (res.statusCode === 200) {
                const events = JSON.parse(data);
                const targetEvent = events.find(e => e.descripcion === "MEGA INCENDIO FORESTAL BIOBIO Y ÑUBLE");
                
                if (targetEvent) {
                    console.log("Found event ID:", targetEvent.id);
                    deleteEvent(targetEvent.id);
                } else {
                    console.log("Event not found.");
                }
            } else {
                console.log("Error fetching events:", res.statusCode);
            }
        });
    });
    
    req.on('error', (e) => {
        console.error("Request error:", e);
    });
    req.end();
}

function deleteEvent(id) {
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/eventos/' + id,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + TOKEN
        }
    };

    const req = http.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 204) {
            console.log("Event deleted successfully.");
        } else {
            console.log("Failed to delete event. Status:", res.statusCode);
            // Print body if error
            res.on('data', d => console.log(d.toString()));
        }
    });
    req.end();
}

getEvents();
