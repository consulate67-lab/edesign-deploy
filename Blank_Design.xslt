<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>

    <xsl:template match="/">
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .page { width: 794px; height: 1123px; border: 1px solid #ddd; margin: 0 auto; padding: 40px; box-sizing: border-box; background: white; position: relative; }
                </style>
            </head>
            <body>
                <div class="page">
                    <!-- Boş Tasarım Başlangıcı -->
                    <div style="position: absolute; top: 50px; left: 50px; font-weight: bold; font-size: 24px;">Yeni Tasarım</div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
