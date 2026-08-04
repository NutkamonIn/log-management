import { osClient } from "../config/opensearch.js";

// ลบข้อมูล Log ที่เก่ากว่า 7 วัน
export const applyRetentionPolicy = async () => {
    try {
        console.log("[Retention] ตรวจสอบและลบ Log ที่เก่ากว่า 7 วัน");

        // deleteByQuery เพื่อลบข้อมูล
        const response = await osClient.deleteByQuery({
            index: 'log-*',
            body: {
                query: {
                    range: {
                        "@timestamp": {
                            lt: "now-7d" // น้อยกว่า 7 วัน
                        }
                    }
                }
            }
        });

        //ตรวจสอบว่าลบไปกี่รายการ
        // Check Number of log that is deleted 
        if ((response.body as any).deleted > 0) {
            console.log(`[Retention] ลบข้อมูลเก่าสำเร็จ จำนวน: ${(response.body as any).deleted} รายการ`);
        } else {
            console.log("[Retention] ไม่มีข้อมูลเก่าที่ต้องลบ")
        }

    } catch (error) {
        console.error("[Retention] เกิดข้อผิดพลาดในการลบข้อมูล:", error);
    }
};
// ฟังก์ชันสำหรับตั้งเวลา (Cron Job) 
export const startRetentionCron = () => {
    // ตั้งให้เช็คทุกๆ 1 นาที (60 * 1000) 
    setInterval(applyRetentionPolicy, 60 * 1000);

    // ลองรันทันที 1 ครั้งตอนเปิด Server
    applyRetentionPolicy();
};
