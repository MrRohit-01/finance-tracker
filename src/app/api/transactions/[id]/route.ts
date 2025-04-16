import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Transaction from "../../../../../models/Transaction";

// Helper for error handling
function handleError(error: Error) {
  console.error(error);
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}

interface Params {
  params: {
    id: string;
  };
}

// Get a single transaction by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    return handleError(error as Error);
  }
}

interface TransactionUpdateData {
  amount?: number;
  description?: string;
  date?: Date;
}

// Update a transaction
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = params;
    const data = await request.json() as TransactionUpdateData;
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    
    // Update the transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { 
        amount: data.amount,
        description: data.description,
        date: data.date || transaction.date
      },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    return handleError(error as Error);
  }
}

// Delete a transaction
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = params;
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error as Error);
  }
}
