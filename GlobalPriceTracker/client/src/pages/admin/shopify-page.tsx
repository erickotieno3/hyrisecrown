import React from 'react';
import ShopifyIntegration from '../../components/shopify-integration';
import AdminLayout from '../../components/admin/admin-layout';

export default function ShopifyPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Shopify Integration</h1>
        <ShopifyIntegration />
      </div>
    </AdminLayout>
  );
}