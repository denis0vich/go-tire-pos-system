-- Test the reports query
SELECT 
    DATE(created_at) as period,
    COUNT(*) as sales_count,
    SUM(total_amount) as revenue,
    SUM(tax_amount) as tax_collected,
    SUM(discount_amount) as discounts_given,
    AVG(total_amount) as avg_sale_amount
FROM sales 
GROUP BY DATE(created_at)
ORDER BY period DESC
LIMIT 5;
