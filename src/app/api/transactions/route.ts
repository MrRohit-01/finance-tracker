import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Transaction from "../../../../models/Transaction";

// Helper to handle errors
function handleError(error: unknown) {
  console.error(error);
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}

// Get all transactions
export async function GET() {
  try {
    await connectDB();
    
    const transactions = await Transaction.find({}).sort({ date: -1 });
    
    return NextResponse.json(transactions);
  } catch (error) {
    return handleError(error);
  }
}

interface TransactionInput {
  amount: number;
  description: string;
  date?: Date;
}

// Create a new transaction
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const data = await request.json() as TransactionInput;
    
    // Validate required fields
    if (!data.amount || !data.description) {
      return NextResponse.json(
        { error: "Amount and description are required" },
        { status: 400 }
      );
    }
    
    const userId = "user123";
    
    const newTransaction = new Transaction({
      ...data,
      userId,
      date: data.date || new Date()
    });
    
    await newTransaction.save();
    
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
