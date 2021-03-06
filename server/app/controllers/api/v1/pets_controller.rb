class Api::V1::PetsController < ApiController
  before_action :authenticate_user

  def create
    @user = current_user
    @pet = @user.pets.new(pet_params)

    if pet_params[:avatar]
      pic = @pet.pictures.new(image: pet_params[:avatar])
      pic.creator = @user
      if !pic.save
        render :json => pic.errors, :status => 422
      end
    end

    if !@pet.save
      render :json => @pet.errors, :status => 422
    end

    render :create
  end

  def update
    @user = current_user
    @pet = set_pet
    if (@pet.owner == @user)
      @pet.assign_attributes(pet_params)
      if !@pet.save
        render :json => @pet.errors, :status => 422
      end
      render :create
    else
      render :json => { error: "User not permitted" }, :status => 422
    end
  end

  def delete
    @pet = set_pet
    @pet.pictures.each do |picture|
      if picture.pets.length == 1
        picture.destroy
      end
    end
    @pet.destroy
    render :json => {
      'deleted': pet_params[:id],
      'userId': current_user.id,
    }
  end

  def show
    @pet = set_pet
    @pictures = @pet.pictures
    @user = current_user
    render :show
  end

  private
    def pet_params
      params.permit(:id, :name, :type, :avatar, :bio, :is_rescue, :is_missing)
    end

    def set_pet
      Pet.find(pet_params[:id])
    end
end
