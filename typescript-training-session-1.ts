// TypeScript Training Session 1: Type Annotations and Basic Types
// ================================================================

// 1. BASIC TYPE ANNOTATIONS
// TypeScript adds static type checking to JavaScript by allowing you to specify types

// Primitive Types
const userName: string = "Alice";
const userAge: number = 30;
const isActive: boolean = true;

// Type inference - TypeScript can often infer types automatically
const inferredString = "Hello"; // TypeScript knows this is a string
const inferredNumber = 42;      // TypeScript knows this is a number

// 2. FUNCTION PARAMETERS AND RETURN TYPES
function greetUser(name: string, age: number): string {
    return `Hello ${name}, you are ${age} years old`;
}

// Arrow function with types
const calculateArea = (width: number, height: number): number => {
    return width * height;
};

// 3. ARRAYS
const numbers: number[] = [1, 2, 3, 4, 5];
const names: string[] = ["Alice", "Bob", "Charlie"];

// Alternative array syntax
const scores: Array<number> = [95, 87, 92];

// 4. OBJECTS WITH TYPE ANNOTATIONS
const user: { name: string; age: number; email: string } = {
    name: "John Doe",
    age: 28,
    email: "john@example.com"
};

// 5. UNION TYPES
// A variable can be one of several types
let id: string | number;
id = "abc123";  // Valid
id = 123;       // Also valid

function printId(id: string | number): void {
    console.log(`ID: ${id}`);
}

// 6. OPTIONAL PROPERTIES
function createUser(name: string, age?: number): { name: string; age?: number } {
    return age ? { name, age } : { name };
}

// 7. TYPE ALIASES
// Create reusable type definitions
type User = {
    name: string;
    age: number;
    email?: string; // Optional property
};

const newUser: User = {
    name: "Sarah",
    age: 25
};

// 8. PRACTICAL EXAMPLES

// Example 1: Shopping cart item
type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

function calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Example 2: API response handling
type ApiResponse = {
    success: boolean;
    data?: any;
    error?: string;
};

function handleApiResponse(response: ApiResponse): void {
    if (response.success && response.data) {
        console.log("Success:", response.data);
    } else if (response.error) {
        console.error("Error:", response.error);
    }
}

// 9. COMMON PATTERNS

// Readonly properties
type ReadonlyUser = {
    readonly id: string;
    name: string;
};

// Function types
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;

// 10. EXERCISES (uncomment and try to fix the type errors)

// Exercise 1: Add type annotations
// function processOrder(orderId, customerName, items) {
//     return {
//         id: orderId,
//         customer: customerName,
//         itemCount: items.length,
//         total: items.reduce((sum, item) => sum + item.price, 0)
//     };
// }

// Exercise 2: Create a type for a blog post
// type BlogPost = {
//     // Add properties: title, content, author, publishDate, tags (array of strings)
// };

// Exercise 3: Fix the function signature
// function updateUser(user, updates) {
//     return { ...user, ...updates };
// }

export {};