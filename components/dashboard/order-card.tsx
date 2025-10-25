import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface OrderCardProps {
  order: {
    id: string
    type: "hourly" | "package" | "system"
    hours: number
    amount: number
    status: "pending" | "in_progress" | "completed"
    createdAt: any
  }
}

export function OrderCard({ order }: OrderCardProps) {
  const getOrderTypeText = (type: string) => {
    switch (type) {
      case "hourly":
        return "บริการรายชั่วโมง"
      case "package":
        return "แพ็คเกจ 36 ชั่วโมง"
      case "system":
        return "บริการกรอกข้อมูลลงระบบ"
      default:
        return type
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
      <div
        className={`h-2 ${
          order.status === "completed"
            ? "bg-green-500"
            : order.status === "in_progress"
              ? "bg-amber-500"
              : "bg-blue-500"
        }`}
      ></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">คำสั่งซื้อ #{order.id.substring(0, 8)}</CardTitle>
          <Badge
            variant={
              order.status === "completed" ? "default" : order.status === "in_progress" ? "secondary" : "outline"
            }
            className={order.status === "in_progress" ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
          >
            {order.status === "completed" ? "เสร็จสิ้น" : order.status === "in_progress" ? "กำลังดำเนินการ" : "รอดำเนินการ"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">ประเภท:</span>
            <span className="font-medium">{getOrderTypeText(order.type)}</span>
          </div>
          {order.hours > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">จำนวนชั่วโมง:</span>
              <span className="font-medium">{order.hours} ชั่วโมง</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">ยอดชำระ:</span>
            <span className="font-medium">{order.amount} บาท</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">วันที่สั่งซื้อ:</span>
            <span className="font-medium">{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 pt-3 pb-3">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/orders/${order.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            ดูรายละเอียด
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
