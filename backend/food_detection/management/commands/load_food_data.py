import csv
from django.core.management.base import BaseCommand
from food_detection.models import Food

class Command(BaseCommand):
    help = 'Load food data from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        with open(csv_file, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                Food.objects.get_or_create(
                    name=row['food_name'],
                    defaults={
                        'category': row['category'],
                        'calories': float(row['calories']),
                        'protein': float(row['protein']),
                        'carbs': float(row['carbs']),
                        'fat': float(row['fat']),
                        'image_url': row['image_url'],
                        'food_class': row['food_class'],
                    }
                )
        self.stdout.write(self.style.SUCCESS('Successfully loaded food data')) 