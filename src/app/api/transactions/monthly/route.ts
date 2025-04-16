import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Transaction from "../../../../../models/Transaction";

interface MonthlyAggregate {
  _id: number;
  total: number;
  count: number;
}

interface FormattedMonthData {
  month: string;
  total: number;
  count: number;
}

export async function GET() {
  try {
    await connectDB();
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Aggregate transactions by month for the current year
    const monthlyData = await Transaction.aggregate<MonthlyAggregate>([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          },
          // For demonstration, using "user123" as userId
          // In a real app, get this from authentication
          userId: "user123"
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format the data for a chart
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const formattedData: FormattedMonthData[] = months.map((month, index) => {
      const monthData = monthlyData.find(d => d._id === index + 1);
      return {
        month,
        total: monthData ? monthData.total : 0,
        count: monthData ? monthData.count : 0
      };
    });
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
