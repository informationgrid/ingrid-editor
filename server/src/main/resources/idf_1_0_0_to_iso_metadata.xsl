<?xml version="1.0"?>
<!--
  **************************************************-
  ingrid-interface-csw
  ==================================================
  Copyright (C) 2014 - 2023 wemove digital solutions GmbH
  ==================================================
  Licensed under the EUPL, Version 1.1 or – as soon they will be
  approved by the European Commission - subsequent versions of the
  EUPL (the "Licence");
  You may not use this work except in compliance with the Licence.
  You may obtain a copy of the Licence at:
  http://ec.europa.eu/idabc/eupl5
  Unless required by applicable law or agreed to in writing, software
  distributed under the Licence is distributed on an "AS IS" basis,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the Licence for the specific language governing permissions and
  limitations under the Licence.
  **************************************************#
  -->

<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:idf="http://www.portalu.de/IDF/1.0"
                xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco"
				xmlns:gmx="http://www.isotc211.org/2005/gmx"
				xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv"
				xmlns:igctx="https://www.ingrid-oss.eu/schemas/igctx"
				xmlns:xlink="http://www.w3.org/1999/xlink"
                exclude-result-prefixes="idf xsi">
	<xsl:output method="xml" />
	<xsl:strip-space elements="*" />

	<xsl:template match="idf:idfMdMetadata">
		<gmd:MD_Metadata>
			<xsl:apply-templates select="@*|node()" />
		</gmd:MD_Metadata>
	</xsl:template>
	<xsl:template match="@uuid[parent::idf:idfMdMetadata]">
		<xsl:attribute name="uuid">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>
	<xsl:template match="@id[parent::idf:idfMdMetadata]">
		<xsl:attribute name="id">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>
    <!-- keep schema location in MD_Metadata, see INGRID-2306 -->
    <xsl:template match="@xsi:schemaLocation[parent::idf:idfMdMetadata]">
        <xsl:attribute name="xsi:schemaLocation">
            <xsl:value-of select="."/>
        </xsl:attribute>
    </xsl:template>

	<xsl:template
		match="@*|*[(namespace-uri() = 'https://www.ingrid-oss.eu/schemas/igctx' or namespace-uri() = 'http://www.isotc211.org/2005/gmd' or namespace-uri() = 'http://www.isotc211.org/2005/gco' or namespace-uri() = 'http://www.opengis.net/gml/3.2' or namespace-uri() = 'http://www.isotc211.org/2005/gmx' or namespace-uri() = 'http://www.isotc211.org/2005/gts' or namespace-uri() = 'http://www.isotc211.org/2005/srv') and namespace-uri() != 'http://www.portalu.de/IDF/1.0']">
		<xsl:element name="{name(.)}" namespace="{namespace-uri(.)}">
			<xsl:copy-of
				select="namespace::*[name(.)!='idf' and name(.)!='srv' and name(.)!='ms' and name(.)!='csw' and name(.)!='xlink' and name(.)!='xsi' and name(.)!='xs' and name(.)!='']" />
			<xsl:copy-of select="@*" />
			<xsl:apply-templates />
		</xsl:element>
	</xsl:template>

	<!--  filter IDF_ResponsibleParty_Type specific elements -->
	<xsl:template match="idf:last-modified" />
	<xsl:template match="idf:additionalOnlineResource" />
	<xsl:template match="idf:hierarchyParty" />
	<xsl:template match="idf:subordinatedParty" />
	<xsl:template match="idf:responsibleParty" />
	<xsl:template match="idf:objectReference" />
	<xsl:template match="@type" />
	<!--  filter IDF_MD_Metadata_Type specific elements -->
	<xsl:template match="idf:superiorReference" />
	<xsl:template match="idf:subordinatedReference" />
	<xsl:template match="idf:crossReference" />
	<xsl:template match="idf:hasAccessConstraint" />
	<xsl:template match="idf:exportCriteria" />
	<xsl:template match="idf:additionalDataSection" />
	<!--  filter IDF_OnlineResource_Type specific elements -->
	<xsl:template match="idf:attachedToField" />
	<!-- filter shared and common attributes -->
	<xsl:template match="@orig-uuid" />
    <!-- filter idf:abstract -->
    <xsl:template match="idf:abstract" />
	<!-- filter idf:doi -->
    <xsl:template match="idf:doi" />
	<!-- filter idf:regionKey -->
    <xsl:template match="idf:regionKey" />
    <!-- filter idf:mapUrl -->
    <xsl:template match="idf:mapUrl" />

    <!-- filter idf:keyword and transform them to gmd:keyword -->
    <xsl:template match="idf:keyword">
      <gco:CharacterString>
        <xsl:apply-templates select="node()" />
      </gco:CharacterString>
    </xsl:template>

	<!--
	Trim Text nodes
	-->
 	<xsl:template match='text()'>
		<xsl:call-template name="trim">
			<xsl:with-param name="s" select="." />
		</xsl:call-template>
	</xsl:template>

	<xsl:template match="idf:idfResponsibleParty">
		<gmd:CI_ResponsibleParty>
			<xsl:apply-templates select="@*|node()" />
		</gmd:CI_ResponsibleParty>
	</xsl:template>
	<xsl:template match="@uuid[parent::idf:idfResponsibleParty]">
		<xsl:attribute name="uuid">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>
	<xsl:template match="@id[parent::idf:idfResponsibleParty]">
		<xsl:attribute name="id">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>

	<xsl:template match="idf:idfOnlineResource">
		<gmd:CI_OnlineResource>
			<xsl:apply-templates select="@*|node()" />
		</gmd:CI_OnlineResource>
	</xsl:template>
	<xsl:template match="@uuid[parent::idf:idfOnlineResource]">
		<xsl:attribute name="uuid">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>
	<xsl:template match="@id[parent::idf:idfOnlineResource]">
		<xsl:attribute name="id">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>

	<xsl:template match="idf:idfLegalBasisConstraints">
		<gmd:MD_LegalConstraints>
			<xsl:apply-templates select="@*|node()" />
		</gmd:MD_LegalConstraints>
	</xsl:template>
	<xsl:template match="@uuid[parent::idf:idfLegalBasisConstraints]">
		<xsl:attribute name="uuid">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>
	<xsl:template match="@id[parent::idf:idfLegalBasisConstraints]">
		<xsl:attribute name="id">
			<xsl:value-of select="."/>
		</xsl:attribute>
	</xsl:template>


	<!-- Template for trimming strings -->
	<xsl:template name="left-trim">
		<xsl:param name="s" />
		<xsl:choose>
			<xsl:when test="substring($s, 1, 1) = ''">
				<xsl:value-of select="$s" />
			</xsl:when>
			<xsl:when test="normalize-space(substring($s, 1, 1)) = ''">
				<xsl:call-template name="left-trim">
					<xsl:with-param name="s" select="substring($s, 2)" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$s" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="right-trim">
		<xsl:param name="s" />
		<xsl:choose>
			<xsl:when test="substring($s, 1, 1) = ''">
				<xsl:value-of select="$s" />
			</xsl:when>
			<xsl:when test="normalize-space(substring($s, string-length($s))) = ''">
				<xsl:call-template name="right-trim">
					<xsl:with-param name="s"
						select="substring($s, 1, string-length($s) - 1)" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$s" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="trim">
		<xsl:param name="s" />
		<xsl:call-template name="right-trim">
			<xsl:with-param name="s">
				<xsl:call-template name="left-trim">
					<xsl:with-param name="s" select="$s" />
				</xsl:call-template>
			</xsl:with-param>
		</xsl:call-template>
	</xsl:template>

</xsl:stylesheet>
