const pool = require("./pool");

const initQuery = `
    CREATE TABLE IF NOT EXISTS Category(
        Category_ID INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        Name VARCHAR(30)
    );

    INSERT INTO Category (Name) VALUES
        ('Handguns'),
        ('Rifles'),
        ('Submachine Guns'),
        ('Machine Guns'),
        ('Sniper Rifles'),
        ('Heavy Weapons');

    CREATE TABLE IF NOT EXISTS Manufacturers (
        ManufacturerID INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        Name VARCHAR(100) UNIQUE NOT NULL,
        Country VARCHAR(50),
        ImagePath VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS Ammo_Types (
        AmmoID INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        CaliberName VARCHAR(100) UNIQUE NOT NULL,
        Type VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Firearms (
        FirearmID INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        ModelName VARCHAR(100) NOT NULL,
        SerialNumber VARCHAR(50) UNIQUE NOT NULL,
        PurchaseDate Date,
        PurchasePrice DECIMAL(10,2),
        ImagePath VARCHAR(255),

        ManufacturerID INT REFERENCES Manufacturers(ManufacturerID),
        AmmoID INT REFERENCES Ammo_Types(AmmoID),
        Category_ID INT REFERENCES Category(Category_ID)
    );

    CREATE TABLE IF NOT EXISTS Attachments (
        AttachmentID INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        Type VARCHAR(50) NOT NULL,
        ModelName VARCHAR(100) NOT NULL,
        Brand VARCHAR(100),
        ImagePath VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS Firearm_attachments (
        MapID INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        FirearmID INT NOT NULL,
        AttachmentID INT NOT NULL,
        InstallDate DATE DEFAULT CURRENT_DATE,

        CONSTRAINT fk_firearm
            FOREIGN KEY(FirearmID)
            REFERENCES Firearms(FirearmID)
            ON DELETE CASCADE,
        CONSTRAINT fk_attachment
            FOREIGN KEY(AttachmentID)
            REFERENCES Attachments(AttachmentID)
            ON DELETE CASCADE
    );
`;

const setupDatabase = async () => {
	try {
		await pool.query(initQuery);
		console.log("[initDB]: Database table initialized.");
		process.exit(0);
	} catch (error) {
		console.error(`[initDB]: Error initializing database: ${error}`);
		process.exit(1);
	}
};

setupDatabase();
