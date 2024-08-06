import TurndownService from 'turndown'

const turndownService = new TurndownService()
turndownService.remove('style')
turndownService.remove('img')

export const html2md = (html: string | ArrayBuffer) => {
  let markdown = turndownService.turndown(html)

  // Remove images
  markdown = markdown.replace(/!\[\]\s*\(data:.+?\)/gm, '')
  markdown = markdown.trim()
  return markdown
}