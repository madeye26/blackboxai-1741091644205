// Reports System Functions
async function loadReportsSystem() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="form-container">
            <h3 class="mb-4">نظام التقارير</h3>
            <ul class="nav nav-tabs" id="reportTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="monthly-tab" data-bs-toggle="tab" 
                            data-bs-target="#monthly" type="button" role="tab">
                        التقارير الشهرية
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="yearly-tab" data-bs-toggle="tab" 
                            data-bs-target="#yearly" type="button" role="tab">
                        التقارير السنوية
                    </button>
                </li>
            </ul>
            <div class="tab-content mt-3" id="reportsTabContent">
                <div class="tab-pane fade show active" id="monthly" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">اختر الشهر</label>
                            <input type="month" class="form-control" id="report-month">
                        </div>
                        <div class="col-md-6 d-flex align-items-end">
                            <button class="btn btn-primary" id="generate-monthly-btn" onclick="generateMonthlyReport()">
                                <span class="btn-text">عرض التقرير</span>
                            </button>
                        </div>
                    </div>
                    <div id="monthly-report-content"></div>
                </div>
                <div class="tab-pane fade" id="yearly" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">اختر السنة</label>
                            <select class="form-select" id="report-year">
                                ${generateYearOptions()}
                            </select>
                        </div>
                        <div class="col-md-6 d-flex align-items-end">
                            <button class="btn btn-primary" id="generate-yearly-btn" onclick="generateYearlyReport()">
                                <span class="btn-text">عرض التقرير</span>
                            </button>
                        </div>
                    </div>
                    <div id="yearly-report-content"></div>
                </div>
            </div>
        </div>
    `;
}

// Generate Monthly Report
async function generateMonthlyReport() {
    const month = document.getElementById('report-month').value;
    if (!month) {
        showAlert('الرجاء اختيار الشهر', 'warning');
        return;
    }

    const resetLoading = showLoading('generate-monthly-btn');
    const reportContent = document.getElementById('monthly-report-content');

    try {
        // Get monthly report data from Supabase
        const response = await fetch(`/api/monthly-reports/${month}`);
        const data = await response.json();

        if (!data.reports || data.reports.length === 0) {
            reportContent.innerHTML = '<div class="alert alert-info">لا توجد بيانات لهذا الشهر</div>';
            return;
        }

        // Generate report HTML
        reportContent.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title mb-4">تقرير شهر ${formatMonth(month)}</h5>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>الموظف</th>
                                    <th>الراتب الأساسي</th>
                                    <th>الحوافز</th>
                                    <th>الأوفرتايم</th>
                                    <th>إجمالي المستحقات</th>
                                    <th>الخصومات</th>
                                    <th>صافي الراتب</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.reports.map(report => `
                                    <tr>
                                        <td>
                                            <div>${report.employee_name}</div>
                                            <small class="text-muted">${report.employee_code}</small>
                                        </td>
                                        <td>${report.basic_salary.toFixed(2)} ج.م</td>
                                        <td>${report.monthly_incentives.toFixed(2)} ج.م</td>
                                        <td>${report.overtime_amount.toFixed(2)} ج.م</td>
                                        <td>${report.gross_salary.toFixed(2)} ج.م</td>
                                        <td>${report.total_deductions.toFixed(2)} ج.م</td>
                                        <td>${report.net_salary.toFixed(2)} ج.م</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" 
                                                    onclick="printPayslip('${report.employee_id}', '${month}')">
                                                <i class="fas fa-print"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="table-active fw-bold">
                                    <td>الإجمالي</td>
                                    <td>${data.totals.total_basic_salary.toFixed(2)} ج.م</td>
                                    <td>${data.totals.total_incentives.toFixed(2)} ج.م</td>
                                    <td>${data.totals.total_overtime.toFixed(2)} ج.م</td>
                                    <td>${data.totals.total_gross.toFixed(2)} ج.م</td>
                                    <td>${data.totals.total_deductions.toFixed(2)} ج.م</td>
                                    <td>${data.totals.total_net.toFixed(2)} ج.م</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Add export buttons
        addExportButtons('monthly', month, reportContent);

    } catch (error) {
        console.error('Error generating report:', error);
        reportContent.innerHTML = '<div class="alert alert-danger">حدث خطأ أثناء إنشاء التقرير</div>';
    } finally {
        resetLoading();
    }
}

// Print individual payslip
async function printPayslip(employeeId, month) {
    try {
        const response = await fetch(`/api/payslips/${employeeId}/${month}`);
        const data = await response.json();

        // Open payslip in new window
        const printWindow = window.open('/reports/payslip/' + employeeId + '/' + month, '_blank');
        if (printWindow) {
            printWindow.focus();
        }
    } catch (error) {
        console.error('Error loading payslip:', error);
        showAlert('حدث خطأ أثناء تحميل كشف المرتب', 'danger');
    }
}

// Helper Functions
function showLoading(buttonId) {
    const btn = document.getElementById(buttonId);
    const btnText = btn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري التحميل...';
    btn.disabled = true;
    return () => {
        btnText.textContent = originalText;
        btn.disabled = false;
    };
}

function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
}

function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    let options = '';
    for (let year = currentYear; year >= currentYear - 5; year--) {
        options += `<option value="${year}">${year}</option>`;
    }
    return options;
}

// Add export buttons to reports
function addExportButtons(type, period, container) {
    const exportBtns = document.createElement('div');
    exportBtns.className = 'export-buttons mt-3';
    exportBtns.innerHTML = `
        <button class="btn btn-sm btn-outline-success me-2" onclick="exportToExcel('${type}', '${period}')">
            <i class="fas fa-file-excel me-1"></i> تصدير Excel
        </button>
        <button class="btn btn-sm btn-outline-danger me-2" onclick="exportToPDF('${type}', '${period}')">
            <i class="fas fa-file-pdf me-1"></i> تصدير PDF
        </button>
        <button class="btn btn-sm btn-outline-primary" onclick="window.print()">
            <i class="fas fa-print me-1"></i> طباعة
        </button>
    `;
    container.parentNode.insertBefore(exportBtns, container.nextSibling);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', loadReportsSystem);
