from django.db import models
from django.utils import timezone
from django.core.validators import MaxLengthValidator

class ConversionHistory(models.Model):
    """Model to store code conversion history"""
    
    LANGUAGE_CHOICES = [
        ('javascript', 'JavaScript'),
        ('python', 'Python'),
        ('java', 'Java'),
        ('cpp', 'C++'),
        ('csharp', 'C#'),
        ('php', 'PHP'),
        ('ruby', 'Ruby'),
        ('go', 'Go'),
        ('rust', 'Rust'),
        ('typescript', 'TypeScript'),
    ]
    
    # Basic information
    source_language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        help_text="Source programming language"
    )
    
    target_language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        help_text="Target programming language"
    )
    
    # Code content
    source_code = models.TextField(
        help_text="Original source code",
        validators=[MaxLengthValidator(50000)]  # 50KB limit
    )
    
    converted_code = models.TextField(
        help_text="AI-converted code",
        validators=[MaxLengthValidator(50000)]  # 50KB limit
    )
    
    # Metadata
    conversion_successful = models.BooleanField(
        default=True,
        help_text="Whether the conversion was successful"
    )
    
    error_message = models.TextField(
        blank=True,
        null=True,
        help_text="Error message if conversion failed"
    )
    
    # Timing information
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the conversion was performed"
    )
    
    processing_time = models.FloatField(
        null=True,
        blank=True,
        help_text="Processing time in seconds"
    )
    
    # Optional user tracking (for future use)
    user_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of the user"
    )
    
    session_key = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        help_text="Session key for anonymous users"
    )
    
    class Meta:
        verbose_name = "Conversion History"
        verbose_name_plural = "Conversion Histories"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['source_language', 'target_language']),
            models.Index(fields=['conversion_successful']),
        ]
    
    def __str__(self):
        return f"{self.source_language} → {self.target_language} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    @property
    def source_code_preview(self):
        """Return a preview of the source code (first 100 characters)"""
        if len(self.source_code) > 100:
            return self.source_code[:97] + "..."
        return self.source_code
    
    @property
    def converted_code_preview(self):
        """Return a preview of the converted code (first 100 characters)"""
        if len(self.converted_code) > 100:
            return self.converted_code[:97] + "..."
        return self.converted_code

class PopularConversion(models.Model):
    """Model to track popular language conversion pairs"""
    
    source_language = models.CharField(max_length=20)
    target_language = models.CharField(max_length=20)
    conversion_count = models.PositiveIntegerField(default=1)
    last_used = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['source_language', 'target_language']
        ordering = ['-conversion_count']
        verbose_name = "Popular Conversion"
        verbose_name_plural = "Popular Conversions"
    
    def __str__(self):
        return f"{self.source_language} → {self.target_language} ({self.conversion_count} times)"

# converter/admin.py
from django.contrib import admin
from .models import ConversionHistory, PopularConversion

@admin.register(ConversionHistory)
class ConversionHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'source_language', 
        'target_language', 
        'conversion_successful', 
        'created_at',
        'processing_time',
        'source_code_preview'
    ]
    
    list_filter = [
        'source_language',
        'target_language', 
        'conversion_successful',
        'created_at'
    ]
    
    search_fields = ['source_code', 'converted_code', 'error_message']
    
    readonly_fields = ['created_at', 'processing_time']
    
    date_hierarchy = 'created_at'
    
    list_per_page = 25
    
    fieldsets = (
        ('Conversion Info', {
            'fields': ('source_language', 'target_language', 'conversion_successful')
        }),
        ('Code', {
            'fields': ('source_code', 'converted_code'),
            'classes': ('collapse',)
        }),
        ('Error Info', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'processing_time', 'user_ip', 'session_key'),
            'classes': ('collapse',)
        }),
    )

@admin.register(PopularConversion)
class PopularConversionAdmin(admin.ModelAdmin):
    list_display = ['source_language', 'target_language', 'conversion_count', 'last_used']
    list_filter = ['source_language', 'target_language']
    ordering = ['-conversion_count']
    readonly_fields = ['last_used']