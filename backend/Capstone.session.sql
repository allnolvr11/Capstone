-- Create admins table
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT unique_username UNIQUE (username) -- Adding unique constraint for username
);

-- Create parking_sessions table
CREATE TABLE parking_sessions (
    session_id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    parking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parking_number INT,
    vehicle_type VARCHAR(10) NOT NULL CHECK (vehicle_type IN ('motorcycle', 'car', 'e-bike')), -- Added 'e-bike' as a vehicle type
    cost DECIMAL(8, 2) NOT NULL,
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) -- Reference admin_id from admins table
);

-- Create Trigger for generating parking_number
CREATE OR REPLACE FUNCTION generate_parking_number() RETURNS TRIGGER AS $$
BEGIN
    NEW.parking_number := (SELECT COALESCE(MAX(parking_number), 0) + 1 FROM parking_sessions);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_parking_number
BEFORE INSERT ON parking_sessions
FOR EACH ROW
EXECUTE FUNCTION generate_parking_number();

-- Create receipts table
CREATE TABLE receipts (
    receipt_id SERIAL PRIMARY KEY,
    parking_session_id INT,
    parking_number INT,
    parking_date TIMESTAMP,
    cost DECIMAL(8, 2),
    FOREIGN KEY (parking_session_id) REFERENCES parking_sessions(session_id)
);

-- Create receipt_retrieval table
CREATE TABLE receipt_retrieval (
    retrieval_id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL,
    session_id INT,
    receipt_id INT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES parking_sessions(session_id),
    FOREIGN KEY (receipt_id) REFERENCES receipts(receipt_id)
);

-- Create parked_vehicles table
CREATE TABLE parked_vehicles (
    parked_vehicle_id SERIAL PRIMARY KEY,
    license_plate_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(10) NOT NULL CHECK (vehicle_type IN ('motorcycle', 'car', 'e-bike')), -- Added 'e-bike' as a vehicle type
    cost DECIMAL(8, 2) NOT NULL,
    parking_number INT,
    entry_time TIMESTAMP,
    FOREIGN KEY (parking_number) REFERENCES parking_sessions(session_id)
);
