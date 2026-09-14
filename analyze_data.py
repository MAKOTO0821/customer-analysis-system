#!/usr/bin/env python3
import json
import csv
from collections import defaultdict
from datetime import datetime

# Load customers data
with open('data/customers.json', 'r', encoding='utf-8') as f:
    customers_data = json.load(f)

customers = {c['name']: c for c in customers_data['customers']}

# Load sales data
sales = []
with open('data/sales-records.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        sales.append({
            'date': row['日付'],
            'customer': row['顧客名'],
            'product': row['製品'],
            'quantity': int(row['数量']),
            'unitPrice': int(row['単価']),
            'total': int(row['合計']),
            'staff': row['担当者']
        })

# Analysis 1: Sales by customer
sales_by_customer = defaultdict(int)
count_by_customer = defaultdict(int)
for sale in sales:
    sales_by_customer[sale['customer']] += sale['total']
    count_by_customer[sale['customer']] += 1

# Analysis 2: Daily sales trend
sales_by_date = defaultdict(int)
for sale in sales:
    sales_by_date[sale['date']] += sale['total']

# Analysis 3: Sales by product
sales_by_product = defaultdict(int)
for sale in sales:
    sales_by_product[sale['product']] += sale['total']

# Analysis 4: Customer status distribution
status_count = defaultdict(int)
for customer in customers_data['customers']:
    status_count[customer['status']] += 1

# Analysis 5: Customer acquisition timeline
acquisition_timeline = []
for customer in customers_data['customers']:
    acquisition_timeline.append({
        'name': customer['name'],
        'date': customer['joinDate'],
        'status': customer['status']
    })
acquisition_timeline.sort(key=lambda x: x['date'])

# Print results in JSON format
results = {
    'salesByCustomer': dict(sorted(sales_by_customer.items(), key=lambda x: x[1], reverse=True)),
    'countByCustomer': dict(count_by_customer),
    'totalSales': sum(sales_by_customer.values()),
    'averageSalesPerTransaction': sum(s['total'] for s in sales) / len(sales) if sales else 0,
    'salesByDate': dict(sorted(sales_by_date.items())),
    'salesByProduct': dict(sorted(sales_by_product.items(), key=lambda x: x[1], reverse=True)),
    'statusCount': dict(status_count),
    'acquisitionTimeline': acquisition_timeline,
    'totalTransactions': len(sales),
    'totalCustomers': len(customers_data['customers']),
    'activeCustomers': status_count['active']
}

print(json.dumps(results, ensure_ascii=False, indent=2))
