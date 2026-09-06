#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// MCPプロトコル実装のシンプル版
class MCPServer {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.tools = {
      'analyze_customers': this.analyzeCustomers.bind(this),
      'analyze_sales': this.analyzeSales.bind(this),
      'get_customer_by_id': this.getCustomerById.bind(this),
      'get_active_customers': this.getActiveCustomers.bind(this),
      'analyze_sales_by_month': this.analyzeSalesByMonth.bind(this),
      'get_sales_by_customer': this.getSalesByCustomer.bind(this),
      'get_top_selling_products': this.getTopSellingProducts.bind(this),
      'get_customer_by_name': this.getCustomerByName.bind(this),
      'get_inactive_customers': this.getInactiveCustomers.bind(this),
      'get_sales_by_product': this.getSalesByProduct.bind(this),
      'get_top_customers': this.getTopCustomers.bind(this),
      'analyze_sales_by_staff': this.analyzeSalesByStaff.bind(this),
    };
  }

  // ツール1: 顧客データ分析
  analyzeCustomers() {
    try {
      const customersPath = path.join(this.dataDir, 'customers.json');
      const data = JSON.parse(fs.readFileSync(customersPath, 'utf8'));

      const totalCustomers = data.customers.length;
      const activeCustomers = data.customers.filter(c => c.status === 'active').length;
      const inactiveCustomers = data.customers.filter(c => c.status === 'inactive').length;

      return {
        success: true,
        data: {
          total_customers: totalCustomers,
          active_customers: activeCustomers,
          inactive_customers: inactiveCustomers,
          version: data.version,
          last_updated: data.lastUpdated
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール2: 売上データ分析
  analyzeSales() {
    try {
      const salesPath = path.join(this.dataDir, 'sales-records.csv');
      const content = fs.readFileSync(salesPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      // ヘッダーをスキップ
      const records = lines.slice(1).map(line => {
        const [date, customer, product, quantity, unitPrice, total, staff] = line.split(',');
        return {
          date: date?.trim(),
          customer: customer?.trim(),
          product: product?.trim(),
          quantity: parseInt(quantity),
          unitPrice: parseInt(unitPrice),
          total: parseInt(total),
          staff: staff?.trim()
        };
      });

      const totalSales = records.reduce((sum, r) => sum + (r.total || 0), 0);
      const uniqueCustomers = new Set(records.map(r => r.customer)).size;
      const uniqueProducts = new Set(records.map(r => r.product)).size;
      const totalRecords = records.length;

      return {
        success: true,
        data: {
          total_records: totalRecords,
          total_sales: totalSales,
          unique_customers: uniqueCustomers,
          unique_products: uniqueProducts,
          average_order_value: Math.round(totalSales / totalRecords)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール3: IDで顧客情報を取得
  getCustomerById(customerId) {
    try {
      const customersPath = path.join(this.dataDir, 'customers.json');
      const data = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
      const customer = data.customers.find(c => c.id === customerId);

      if (!customer) {
        return { success: false, error: `顧客ID ${customerId} が見つかりません` };
      }

      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール4: アクティブな顧客一覧
  getActiveCustomers() {
    try {
      const customersPath = path.join(this.dataDir, 'customers.json');
      const data = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
      const activeCustomers = data.customers.filter(c => c.status === 'active');

      return {
        success: true,
        data: activeCustomers
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール5: 月ごとの売上推移
  analyzeSalesByMonth() {
    try {
      const salesPath = path.join(this.dataDir, 'sales-records.csv');
      const content = fs.readFileSync(salesPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      const records = lines.slice(1).map(line => {
        const [date, customer, product, quantity, unitPrice, total, staff] = line.split(',');
        return {
          date: date?.trim(),
          total: parseInt(total) || 0
        };
      });

      const monthlyData = {};
      records.forEach(r => {
        const month = r.date?.substring(0, 7);
        if (month) {
          monthlyData[month] = (monthlyData[month] || 0) + r.total;
        }
      });

      return {
        success: true,
        data: monthlyData
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール6: 顧客別売上
  getSalesByCustomer(customerId) {
    try {
      const salesPath = path.join(this.dataDir, 'sales-records.csv');
      const content = fs.readFileSync(salesPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      const records = lines.slice(1).map(line => {
        const [date, customer, product, quantity, unitPrice, total, staff] = line.split(',');
        return {
          date: date?.trim(),
          customer: customer?.trim(),
          product: product?.trim(),
          quantity: parseInt(quantity),
          unitPrice: parseInt(unitPrice),
          total: parseInt(total) || 0
        };
      });

      const customerSales = records.filter(r => r.customer === customerId);
      if (customerSales.length === 0) {
        return { success: false, error: `顧客 ${customerId} の売上記録が見つかりません` };
      }

      const totalAmount = customerSales.reduce((sum, r) => sum + r.total, 0);
      const totalQuantity = customerSales.reduce((sum, r) => sum + r.quantity, 0);

      return {
        success: true,
        data: {
          customer_name: customerId,
          total_amount: totalAmount,
          total_quantity: totalQuantity,
          transaction_count: customerSales.length,
          records: customerSales
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール7: 製品別売上ランキング
  getTopSellingProducts(limit = 5) {
    try {
      const salesPath = path.join(this.dataDir, 'sales-records.csv');
      const content = fs.readFileSync(salesPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      const records = lines.slice(1).map(line => {
        const [date, customer, product, quantity, unitPrice, total, staff] = line.split(',');
        return {
          product: product?.trim(),
          quantity: parseInt(quantity),
          total: parseInt(total) || 0
        };
      });

      const productData = {};
      records.forEach(r => {
        if (r.product) {
          if (!productData[r.product]) {
            productData[r.product] = { total_sales: 0, total_quantity: 0, transaction_count: 0 };
          }
          productData[r.product].total_sales += r.total;
          productData[r.product].total_quantity += r.quantity;
          productData[r.product].transaction_count += 1;
        }
      });

      const ranking = Object.entries(productData)
        .map(([product, data]) => ({
          product,
          ...data,
          average_price: Math.round(data.total_sales / data.transaction_count)
        }))
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, limit);

      return {
        success: true,
        data: ranking
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール8: 顧客名で検索
  getCustomerByName(name) {
    try {
      const customersPath = path.join(this.dataDir, 'customers.json');
      const data = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
      const customer = data.customers.find(c => c.name.includes(name));

      if (!customer) {
        return { success: false, error: `顧客 "${name}" が見つかりません` };
      }

      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール9: 非アクティブな顧客一覧
  getInactiveCustomers() {
    try {
      const customersPath = path.join(this.dataDir, 'customers.json');
      const data = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
      const inactiveCustomers = data.customers.filter(c => c.status === 'inactive');

      return {
        success: true,
        data: inactiveCustomers,
        count: inactiveCustomers.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール10: 製品別売上詳細
  getSalesByProduct(productName) {
    try {
      const salesPath = path.join(this.dataDir, 'sales-records.csv');
      const content = fs.readFileSync(salesPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      const records = lines.slice(1).map(line => {
        const [date, customer, product, quantity, unitPrice, total, staff] = line.split(',');
        return {
          date: date?.trim(),
          customer: customer?.trim(),
          product: product?.trim(),
          quantity: parseInt(quantity),
          unitPrice: parseInt(unitPrice),
          total: parseInt(total) || 0,
          staff: staff?.trim()
        };
      });

      const productSales = records.filter(r => r.product === productName);
      if (productSales.length === 0) {
        return { success: false, error: `製品 "${productName}" の売上記録が見つかりません` };
      }

      const totalAmount = productSales.reduce((sum, r) => sum + r.total, 0);
      const totalQuantity = productSales.reduce((sum, r) => sum + r.quantity, 0);

      return {
        success: true,
        data: {
          product_name: productName,
          total_sales: totalAmount,
          total_quantity: totalQuantity,
          transaction_count: productSales.length,
          average_price: Math.round(totalAmount / productSales.length),
          records: productSales
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール11: VIP顧客（売上トップ顧客）
  getTopCustomers(limit = 5) {
    try {
      const salesPath = path.join(this.dataDir, 'sales-records.csv');
      const content = fs.readFileSync(salesPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      const records = lines.slice(1).map(line => {
        const [date, customer, product, quantity, unitPrice, total, staff] = line.split(',');
        return {
          customer: customer?.trim(),
          total: parseInt(total) || 0,
          quantity: parseInt(quantity)
        };
      });

      const customerData = {};
      records.forEach(r => {
        if (r.customer) {
          if (!customerData[r.customer]) {
            customerData[r.customer] = { total_spent: 0, total_quantity: 0, transaction_count: 0 };
          }
          customerData[r.customer].total_spent += r.total;
          customerData[r.customer].total_quantity += r.quantity;
          customerData[r.customer].transaction_count += 1;
        }
      });

      const ranking = Object.entries(customerData)
        .map(([customer, data]) => ({
          customer_name: customer,
          ...data,
          average_transaction: Math.round(data.total_spent / data.transaction_count)
        }))
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, limit);

      return {
        success: true,
        data: ranking
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ツール12: スタッフ別売上パフォーマンス
  analyzeSalesByStaff() {
    try {
      const salesPath = path.join(this.dataDir, 'sales-records.csv');
      const content = fs.readFileSync(salesPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      const records = lines.slice(1).map(line => {
        const [date, customer, product, quantity, unitPrice, total, staff] = line.split(',');
        return {
          staff: staff?.trim(),
          total: parseInt(total) || 0,
          quantity: parseInt(quantity)
        };
      });

      const staffData = {};
      records.forEach(r => {
        if (r.staff) {
          if (!staffData[r.staff]) {
            staffData[r.staff] = { total_sales: 0, total_quantity: 0, transaction_count: 0 };
          }
          staffData[r.staff].total_sales += r.total;
          staffData[r.staff].total_quantity += r.quantity;
          staffData[r.staff].transaction_count += 1;
        }
      });

      const staffPerformance = Object.entries(staffData)
        .map(([staff, data]) => ({
          staff_name: staff,
          ...data,
          average_transaction: Math.round(data.total_sales / data.transaction_count)
        }))
        .sort((a, b) => b.total_sales - a.total_sales);

      return {
        success: true,
        data: staffPerformance
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // MCPリクエストを処理
  handleRequest(request) {
    const { method, params } = request;

    switch (method) {
      case 'tools/list':
        return {
          tools: [
            {
              name: 'analyze_customers',
              description: '顧客データの統計情報を取得',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'analyze_sales',
              description: '売上データの統計情報を取得',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'get_customer_by_id',
              description: 'IDで特定の顧客情報を取得',
              inputSchema: {
                type: 'object',
                properties: {
                  customer_id: { type: 'number', description: '顧客ID' }
                },
                required: ['customer_id']
              }
            },
            {
              name: 'get_active_customers',
              description: 'アクティブな顧客の一覧を取得',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'analyze_sales_by_month',
              description: '月ごとの売上推移を取得',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'get_sales_by_customer',
              description: '顧客別の売上詳細を取得',
              inputSchema: {
                type: 'object',
                properties: {
                  customer_id: { type: 'string', description: '顧客名' }
                },
                required: ['customer_id']
              }
            },
            {
              name: 'get_top_selling_products',
              description: '売上ランキングトップ5の製品を取得',
              inputSchema: {
                type: 'object',
                properties: {
                  limit: { type: 'number', description: '取得する件数（デフォルト：5）' }
                }
              }
            },
            {
              name: 'get_customer_by_name',
              description: '顧客名で顧客情報を検索',
              inputSchema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: '顧客名（部分一致）' }
                },
                required: ['name']
              }
            },
            {
              name: 'get_inactive_customers',
              description: '非アクティブな顧客の一覧を取得',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'get_sales_by_product',
              description: '製品別の売上詳細を取得',
              inputSchema: {
                type: 'object',
                properties: {
                  product_name: { type: 'string', description: '製品名' }
                },
                required: ['product_name']
              }
            },
            {
              name: 'get_top_customers',
              description: '売上トップの顧客（VIP顧客）を取得',
              inputSchema: {
                type: 'object',
                properties: {
                  limit: { type: 'number', description: '取得する件数（デフォルト：5）' }
                }
              }
            },
            {
              name: 'analyze_sales_by_staff',
              description: 'スタッフ別の売上パフォーマンスを分析',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            }
          ]
        };

      case 'tools/call':
        const toolName = params.name;
        const toolArgs = params.arguments || {};

        if (toolName === 'get_customer_by_id') {
          return this.getCustomerById(toolArgs.customer_id);
        } else if (toolName === 'get_sales_by_customer') {
          return this.getSalesByCustomer(toolArgs.customer_id);
        } else if (toolName === 'get_top_selling_products') {
          return this.getTopSellingProducts(toolArgs.limit);
        } else if (toolName === 'get_customer_by_name') {
          return this.getCustomerByName(toolArgs.name);
        } else if (toolName === 'get_sales_by_product') {
          return this.getSalesByProduct(toolArgs.product_name);
        } else if (toolName === 'get_top_customers') {
          return this.getTopCustomers(toolArgs.limit);
        } else if (this.tools[toolName]) {
          return this.tools[toolName]();
        } else {
          return { success: false, error: `ツール ${toolName} が見つかりません` };
        }

      default:
        return { success: false, error: `不明なメソッド: ${method}` };
    }
  }

  // MCPサーバー起動
  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    console.error('[MCP] カスタム顧客分析サーバーが起動しました');

    rl.on('line', (line) => {
      try {
        const request = JSON.parse(line);
        const response = this.handleRequest(request);
        console.log(JSON.stringify(response));
      } catch (error) {
        console.log(JSON.stringify({ success: false, error: error.message }));
      }
    });

    rl.on('close', () => {
      console.error('[MCP] サーバーを停止しました');
      process.exit(0);
    });
  }
}

// サーバー起動
const server = new MCPServer();
server.start();