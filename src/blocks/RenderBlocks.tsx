import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { AboutTeacherBlock } from '@/blocks/AboutTeacher/Component'
import { AboutUsBlock } from '@/blocks/AboutUs/Component'
import { ClassesGridBlock } from '@/blocks/ClassesGrid/Component'
import { EnrollmentCTABlock } from '@/blocks/EnrollmentCTA/Component'
import { FAQBlock } from '@/blocks/FAQ/Component'
import { InstituteContactBlock } from '@/blocks/InstituteContact/Component'
import { InstituteHeroBlock } from '@/blocks/InstituteHero/Component'
import { InstituteTestimonialsBlock } from '@/blocks/InstituteTestimonials/Component'
import { ScheduleBlock } from '@/blocks/Schedule/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  aboutUs: AboutUsBlock,
  aboutTeacher: AboutTeacherBlock,
  classesGrid: ClassesGridBlock,
  enrollmentCTA: EnrollmentCTABlock,
  faq: FAQBlock,
  instituteContact: InstituteContactBlock,
  instituteHero: InstituteHeroBlock,
  instituteTestimonials: InstituteTestimonialsBlock,
  schedule: ScheduleBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents]

            if (Block) {
              return (
                <div key={index}>
                  {/* @ts-expect-error block unions are narrowed at runtime */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
