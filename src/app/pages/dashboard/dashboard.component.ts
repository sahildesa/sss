import { Component } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // Stat Cards
  stats = [
    {
      icon: 'bi-person-circle',
      label: 'Current applications',
      value: 254,
      color: 'red',
    },
    {
      icon: 'bi-star',
      label: 'Total number of staff',
      value: 115,
      color: 'green',
    },
    { icon: 'bi-building', label: 'Departments', value: 13, color: 'purple' },
    { icon: 'bi-inbox', label: 'Requests', value: 74, color: 'black' },
  ];

  // Payment vouchers
  paymentVouchers = [
    {
      subject: 'Request for Return Product',
      date: '25/10/2025',
      status: 'Pending',
    },
    {
      subject: 'Out of Stock items payment',
      date: '25/10/2025',
      status: 'Approved',
    },
    {
      subject: 'Request for damage products refunds',
      date: '25/10/2025',
      status: 'Approved',
    },
    {
      subject: 'Request for Return Product',
      date: '25/10/2025',
      status: 'Pending',
    },
    {
      subject: 'Request for Return Product',
      date: '25/10/2025',
      status: 'Approved',
    },
  ];

  // Budget history
  budgetHistory = [
    {
      sn: '01',
      budgetNo: '002154',
      amount: '$1,405,65',
      actual: '$1,405,65',
      date: '25/10/2025',
    },
    {
      sn: '02',
      budgetNo: '0152364',
      amount: '$1,755,65',
      actual: '$1,755,65',
      date: '25/10/2025',
    },
    {
      sn: '03',
      budgetNo: '0236954',
      amount: '$1,63,65',
      actual: '$1,63,65',
      date: '25/10/2025',
    },
    {
      sn: '04',
      budgetNo: '7847592',
      amount: '$1,405,41',
      actual: '$1,405,41',
      date: '25/10/2025',
    },
    {
      sn: '05',
      budgetNo: '7741256',
      amount: '$74,405,65',
      actual: '$74,405,65',
      date: '25/10/2025',
    },
  ];

  // === Card 1: Staff Application Doughnut Chart ===
  staffChartData: ChartData<'doughnut'> = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [100, 84, 100],
        backgroundColor: ['#6f42c1', '#dc3545', '#ffc107'],
        borderWidth: 4,
      },
    ],
  };

  staffChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    cutout: '75%' as any, // ✅ Correct location
    elements: {
      arc: {
        borderWidth: 4,
      },
    },
  };

  // === Card 2: Stacked Bar Chart ===
  stackedBarData: ChartData<'bar'> = {
    labels: ['30 Sep', '10 Nov', '20 Sep', '30 Sep', '10 Oct'],
    datasets: [
      {
        label: 'Shipped',
        data: [200000, 300000, 180000, 400000, 250000],
        backgroundColor: '#6f42c1',
        stack: 'stack1',
      },
      {
        label: 'Damaged',
        data: [150000, 200000, 120000, 100000, 80000],
        backgroundColor: '#dc3545',
        stack: 'stack1',
      },
      {
        label: 'Return',
        data: [100000, 100000, 80000, 90000, 70000],
        backgroundColor: '#ffc107',
        stack: 'stack1',
      },
    ],
  };

  stackedBarOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        ticks: {
          callback: (value: any) => `${(value / 1000).toFixed(0)}k`,
        },
      },
    },
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  // === Card 3: Line Area Chart with Highlight ===
  lineAreaChartData: ChartData<'line'> = {
    labels: ['30 Sep', '10 Nov', '20 Sep', '30 Sep', '10 Oct'],
    datasets: [
      {
        label: 'Sales',
        data: [1000000, 3000000, 8400652, 6000000, 9000000],
        fill: 'origin',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, '#6f42c1cc');
          gradient.addColorStop(1, '#6f42c100');
          return gradient;
        },
        borderColor: '#6f42c1',
        tension: 0.4,
        pointBackgroundColor: '#dc3545',
        pointRadius: (ctx) => (ctx.dataIndex === 2 ? 6 : 3),
        pointHoverRadius: 6,
      },
    ],
  };

  lineAreaChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            return `$${ctx.raw?.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `${(value / 1_000_000).toFixed(0)}m`,
        },
      },
    },
  };
}
