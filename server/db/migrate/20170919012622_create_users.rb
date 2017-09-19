class CreateUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :users do |t|
      t.string :email, unique: true, index: true
      t.string :password_digest
      t.string :username, unique: true, index: true
      t.string :gender
      t.string :facebook_id, unique: true, index: true
      t.string :facebook_email
      t.string :avatar

      t.timestamps
    end
  end
end
