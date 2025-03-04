# دليل إعداد Supabase لنظام الرواتب

هذا الدليل يشرح كيفية إعداد واستخدام Supabase كقاعدة بيانات سحابية لنظام الرواتب الخاص بك.

## الخطوة 1: إعداد مشروع Supabase

تم بالفعل إنشاء مشروع Supabase الخاص بك مع المعلومات التالية:

- **رابط المشروع**: https://verkzsdjklsxsxbsolyt.supabase.co
- **مفتاح API**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcmt6c2Rqa2xzeHN4YnNvbHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTc2NjMsImV4cCI6MjA1NjQ5MzY2M30.MPYXWhKIw6luhWt5UDRug-Smh5G1ppJjiK0UQIMRQT8

## الخطوة 2: إنشاء جداول قاعدة البيانات

1. قم بتسجيل الدخول إلى لوحة تحكم Supabase الخاصة بك على الرابط: https://app.supabase.io
2. اختر مشروعك من القائمة
3. انتقل إلى قسم "SQL Editor" من القائمة الجانبية
4. انسخ محتوى ملف `database/supabase_schema.sql` وألصقه في محرر SQL
5. اضغط على زر "Run" لتنفيذ الاستعلام وإنشاء جميع الجداول

## الخطوة 3: تكوين التطبيق لاستخدام Supabase

تم بالفعل تحديث ملف `js/supabase.js` بمعلومات الاتصال الخاصة بك. للتأكد من أن التطبيق يستخدم Supabase بدلاً من MySQL، اتبع الخطوات التالية:

1. افتح ملف `server.js` وتأكد من استيراد وحدة Supabase بدلاً من وحدة MySQL:

```javascript
const db = require('./js/supabase');
```

2. قم بتحديث ملف `.env` بمعلومات Supabase الخاصة بك:

```
# Supabase Configuration
SUPABASE_URL=https://verkzsdjklsxsxbsolyt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcmt6c2Rqa2xzeHN4YnNvbHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTc2NjMsImV4cCI6MjA1NjQ5MzY2M30.MPYXWhKIw6luhWt5UDRug-Smh5G1ppJjiK0UQIMRQT8
```

## الخطوة 4: استخدام الجداول الإضافية

تم إنشاء الجداول التالية لدعم وظائف التطبيق المختلفة:

### جدول dashboard_config
يستخدم لتخزين تكوينات لوحة التحكم المخصصة للمستخدمين. يمكنك استخدامه مع `dashboard-customizer.js`.

### جدول theme_preferences
يخزن تفضيلات السمة للمستخدمين، بما في ذلك الوضع الداكن وألوان السمة. يستخدم مع `theme-switcher.js` و `theme-color-selector.js`.

### جدول leave_requests
يدير طلبات الإجازة للموظفين. يستخدم مع `leave-management.js`.

### جدول tasks
يتتبع المهام المخصصة للموظفين. يستخدم مع `task-management.js`.

### جدول time_entries
يسجل أوقات تسجيل الدخول والخروج للموظفين. يستخدم مع `time-tracking.js`.

### جدول analytics_data
يخزن بيانات التحليلات المتقدمة. يستخدم مع `advanced-analytics.js`.

## الخطوة 5: تنفيذ وظائف قاعدة البيانات الإضافية

لاستخدام الجداول الجديدة، يمكنك إضافة وظائف قاعدة البيانات إلى ملف `js/supabase.js`. على سبيل المثال:

```javascript
// وظائف إدارة الإجازات
getLeaveRequests: async (employeeId) => {
    const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data;
},

createLeaveRequest: async (leaveRequest) => {
    const { data, error } = await supabase
        .from('leave_requests')
        .insert([{
            employee_id: leaveRequest.employeeId,
            start_date: leaveRequest.startDate,
            end_date: leaveRequest.endDate,
            leave_type: leaveRequest.leaveType,
            reason: leaveRequest.reason
        }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
}
```

## الخطوة 6: تشغيل التطبيق

1. تأكد من تثبيت جميع التبعيات:

```
npm install
```

2. قم بتشغيل الخادم:

```
npm start
```

3. افتح المتصفح وانتقل إلى `http://localhost:3000`

## ملاحظات إضافية

### سياسات أمان RLS

تم تكوين سياسات أمان Row Level Security (RLS) في Supabase لحماية بياناتك. يمكنك تعديل هذه السياسات من خلال لوحة تحكم Supabase في قسم "Authentication" > "Policies".

### تحديث التطبيق

إذا كنت تستخدم وظائف إضافية مثل إدارة المهام أو تتبع الوقت، تأكد من إضافة واجهات برمجة التطبيقات المقابلة في ملف `server.js`.

### النسخ الاحتياطي والاسترداد

يمكنك استخدام ميزات النسخ الاحتياطي والاسترداد المدمجة في Supabase من خلال لوحة التحكم في قسم "Database" > "Backups".

### تحسين الأداء

تم تكوين فهارس قاعدة البيانات لتحسين أداء الاستعلامات. إذا لاحظت أي مشكلات في الأداء، يمكنك إضافة فهارس إضافية حسب الحاجة.