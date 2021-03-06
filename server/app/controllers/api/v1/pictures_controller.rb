class Api::V1::PicturesController < ApiController
  before_action :authenticate_user

  def create
    @user = current_user
    @picture = Picture.new image: params[:image]
    @picture.creator = @user
    @picture.caption = params[:caption]
    JSON.parse(params[:pets]).each do |pet|
      @picture.pets << Pet.find(pet)
    end
    if (params[:place_name] &&
      params[:google_place_id] &&
      params[:longitude] &&
      params[:latitude])
      @place = Place.find_or_create_by google_place_id: params[:google_place_id]
      @place.longitude = params[:longitude]
      @place.latitude = params[:latitude]
      @place.name = params[:place_name]
      if !@place.save
        render :json => @place.errors, :status => 422
      end
      @picture.place = @place
    end
    if @picture.save
      render :json => @picture.place
    else
      render :json => @picture.errors, :status => 422
    end
  end

  def show
    @pic = set_pic
    @user = current_user
    render :show
  end

  def like
    @pic = set_pic
    @user = current_user
    @user.like(@pic)
    create_notification @pic
    render :show
  end

  def unlike
    @pic = set_pic
    @user = current_user
    @user.unlike(@pic)
    render :show
  end

  private
    def pic_params
      params.permit(:pic_id)
    end

    def create_notification(picture)
      return if picture.creator.id == current_user.id
      Notification.create(user_id: picture.creator.id,
                          notified_by_id: current_user.id,
                          picture_id: picture.id,
                          notice_type: 'like')
    end

    def set_pic
      Picture.find(pic_params[:pic_id])
    end
end
