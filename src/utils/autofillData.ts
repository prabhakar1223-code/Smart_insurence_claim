export interface AutofillData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
}

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle'
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const streets = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St',
  'Washington Blvd', 'Park Ave', 'Lake Dr', 'Hill Rd', 'Forest Ln', 'River St'
];

const genders = ['Male', 'Female', 'Other'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber(): string {
  const areaCode = getRandomNumber(200, 999);
  const prefix = getRandomNumber(200, 999);
  const lineNumber = getRandomNumber(1000, 9999);
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
  const domain = getRandomElement(domains);
  const randomNum = getRandomNumber(1, 999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domain}`;
}

function generateDateOfBirth(): string {
  const year = getRandomNumber(1960, 2000);
  const month = String(getRandomNumber(1, 12)).padStart(2, '0');
  const day = String(getRandomNumber(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateZipCode(): string {
  return String(getRandomNumber(10000, 99999));
}

function generateAddress(): string {
  const streetNumber = getRandomNumber(100, 9999);
  const street = getRandomElement(streets);
  return `${streetNumber} ${street}`;
}

export function generateAutofillData(): AutofillData {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  
  return {
    fullName: `${firstName} ${lastName}`,
    email: generateEmail(firstName, lastName),
    phoneNumber: generatePhoneNumber(),
    address: generateAddress(),
    city: getRandomElement(cities),
    state: getRandomElement(states),
    zipCode: generateZipCode(),
    dateOfBirth: generateDateOfBirth(),
    gender: getRandomElement(genders)
  };
}
