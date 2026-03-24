import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from market.models import Product
from market.serializers import ProductSerializer

products = Product.objects.all()
print(f'Total products: {products.count()}')
for p in products:
    try:
        data = ProductSerializer(p).data
        print(f'OK id={p.id} name={data.get("name")} catalog_id={p.catalog_id}')
    except Exception as e:
        print(f'ERROR id={p.id}: {e}')
