import { ServerService } from '../../../core'
import { FormReactive } from '../../../shared'
import { USER_ROLE_LABELS, VideoResolution } from '../../../../../../shared'
import { ConfigService } from '@app/+admin/config/shared/config.service'
import { UserAdminFlag } from '@shared/models/users/user-flag.model'

export abstract class UserEdit extends FormReactive {
  videoQuotaOptions: { value: string, label: string }[] = []
  videoQuotaDailyOptions: { value: string, label: string }[] = []
  roles = Object.keys(USER_ROLE_LABELS).map(key => ({ value: key.toString(), label: USER_ROLE_LABELS[key] }))
  username: string
  userId: number

  protected abstract serverService: ServerService
  protected abstract configService: ConfigService
  abstract isCreation (): boolean
  abstract getFormButtonTitle (): string

  isTranscodingInformationDisplayed () {
    const formVideoQuota = parseInt(this.form.value['videoQuota'], 10)

    return this.serverService.getConfig().transcoding.enabledResolutions.length !== 0 &&
           formVideoQuota > 0
  }

  computeQuotaWithTranscoding () {
    const transcodingConfig = this.serverService.getConfig().transcoding

    const resolutions = transcodingConfig.enabledResolutions
    const higherResolution = VideoResolution.H_1080P
    let multiplier = 0

    for (const resolution of resolutions) {
      multiplier += resolution / higherResolution
    }

    if (transcodingConfig.hls.enabled) multiplier *= 2

    return multiplier * parseInt(this.form.value['videoQuota'], 10)
  }

  resetPassword () {
    return
  }

  protected buildAdminFlags (formValue: any) {
    return formValue.byPassAutoBlacklist ? UserAdminFlag.BY_PASS_VIDEO_AUTO_BLACKLIST : UserAdminFlag.NONE
  }

  protected buildQuotaOptions () {
    // These are used by a HTML select, so convert key into strings
    this.videoQuotaOptions = this.configService
                                 .videoQuotaOptions.map(q => ({ value: q.value.toString(), label: q.label }))

    this.videoQuotaDailyOptions = this.configService
                                      .videoQuotaDailyOptions.map(q => ({ value: q.value.toString(), label: q.label }))
  }
}
