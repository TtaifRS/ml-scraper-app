import {dialog} from 'electron'
import fs from 'fs'
import {format} from 'fast-csv'
import GelbeseitenCompany, { AdditionalInfo, SocialMedia } from '../../models/gelbeseitenCompany.model.js'


export default async function exportYellowPageCompaniesToCSV(event: Electron.IpcMainEvent) {
  try{
    const companies = await GelbeseitenCompany.find().exec()
    console.log(`Companies length: ${companies.length}`)

    if(companies.length === 0) {
      return event.reply('download-yellowpage-csv-result', 'No companies found')
    }

    const {filePath} = await dialog.showSaveDialog({
      buttonLabel: 'Save CSV',
      defaultPath: `yellowpage_companies_${Date.now()}.csv`,
      filters: [{name: 'CSV Files', extensions: ['csv']}]
    })

    if(!filePath) {
      return event.reply('download-yellowpage-csv-error', 'please choose a location to save the csv')
    }

    const MAX_ROWS = 20000
    const totalParts = Math.ceil(companies.length / MAX_ROWS)

    const formatSocialMedia = (socialMedia: SocialMedia[]): string => {
      return socialMedia?.map(sm => `${sm.platform}: ${sm.platformLink}`).join('; ') || 'N/A'
    }

    const formatAdditionalInfo = (additionalInfo: AdditionalInfo[]): string => {
      return additionalInfo?.map(info => `${info.infoTitle}: ${info.info.join(', ')}`).join('; ') || 'N/A'
    }

    for(let i = 0; i < totalParts; i++){
      const chunk = companies.slice(i * MAX_ROWS, (i + 1) * MAX_ROWS)
      if(chunk.length === 0) continue;

      const fileName = filePath.includes('.csv') ? filePath.replace(/\.csv$/, `_Part${i+1}.csv`) : `${filePath}_Part${i+1}.csv`

      await new Promise<void>((resolve, reject) => {
        const ws = fs.createWriteStream(fileName)
        const csvStream = format({headers: true})
        csvStream.pipe(ws)

        chunk.forEach((company) => {
          csvStream.write({
            Name: company.name,
            'Gelbeseiten Link': company.gelbeseitenLink,
            Category: company.category,
            'Sub Category': company.subCategory,
            Industry: company.industry,
            Logo: company.logo || 'N/A',
            City: company.city,
            Rating: company.rating || 'N/A',
            'Review Count': company.reviewCount || 'N/A',
            Address: company.address || 'N/A',
            Telephone: company.telephoneNumber || 'N/A',
            Fax: company.fax || 'N/A',
            Email: company.email || 'N/A',
            Website: company.website || 'N/A',
            'Social Media': company.socialMedia ? formatSocialMedia(company.socialMedia) : 'N/A',
            'Business Card': company.businessCard || 'N/A',
            'About Us': company.aboutUs || 'N/A',
            'Additional Info': company.companyAdditionalInfo ? formatAdditionalInfo(company.companyAdditionalInfo) : 'N/A',
            'Brochure URL': company.brochureURL || 'N/A',
            'Created At': company.createdAt,
          })
        })

        csvStream.end()

        ws.on('finish', () => {
          event.reply('download-yellowpage-csv-result', `CSV saved at: ${fileName}`)
          resolve()
        })

        ws.on('error', reject)
      })
    }
  }catch(error){
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
    event.reply('download-yellowpage-csv-error', errorMessage)
  }
}